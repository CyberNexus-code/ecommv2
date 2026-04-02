import { NextRequest, NextResponse } from "next/server";
import { saveGoogleOAuthTokens } from "@/lib/auth/oauthTokens";
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
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(new URL("/login?reset=invalid", requestUrl.origin));
    }

    await saveGoogleOAuthTokens(data.session);

    if (process.env.NODE_ENV === "development") {
      return NextResponse.redirect(`${requestUrl.origin}${next}`);
    }

    if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${next}`);
    }

    return NextResponse.redirect(`${requestUrl.origin}${next}`);
  }

  // Flow C: links that carry tokens in URL hash are not visible to server routes.
  // Let the client reset page handle them instead of failing immediately.
  return NextResponse.redirect(new URL("/auth/reset-password", requestUrl.origin));
}
