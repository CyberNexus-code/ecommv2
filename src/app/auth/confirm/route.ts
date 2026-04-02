import { NextRequest, NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const forwardedHost = request.headers.get("x-forwarded-host");
  let next = requestUrl.searchParams.get("next") ?? "/";

  if (!next.startsWith("/")) {
    next = "/";
  }

  const authFinalizePath = code
    ? `/auth/finalize?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`
    : `/auth/finalize?next=${encodeURIComponent(next)}`;

  const redirectUrl =
    process.env.NODE_ENV === "development"
      ? `${requestUrl.origin}${authFinalizePath}`
      : forwardedHost
        ? `https://${forwardedHost}${authFinalizePath}`
        : `${requestUrl.origin}${authFinalizePath}`;

  const supabase = await createServer();

  // Flow A: token_hash + type (OTP verification flow)
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (error) {
      return NextResponse.redirect(new URL("/login?reset=invalid", requestUrl.origin));
    }

    // If this is a recovery type, redirect to reset password page
    if (type === "recovery") {
      return NextResponse.redirect(new URL("/auth/reset-password", requestUrl.origin));
    }

    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  // Flow B: code (PKCE/code flow)
  if (code) {
    return NextResponse.redirect(redirectUrl);
  }

  // Flow C: links that carry tokens in URL hash are not visible to server routes.
  // Let the client reset page handle them instead of failing immediately.
  return NextResponse.redirect(new URL("/auth/reset-password", requestUrl.origin));
}
