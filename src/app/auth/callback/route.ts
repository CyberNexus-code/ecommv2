import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const forwardedHost = request.headers.get("x-forwarded-host");
  let next = searchParams.get("next") ?? "/";

  if (!next.startsWith("/")) {
    next = "/";
  }

  const authFinalizePath = code
    ? `/auth/finalize?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`
    : `/auth/finalize?next=${encodeURIComponent(next)}`;

  const redirectUrl =
    process.env.NODE_ENV === "development"
      ? `${origin}${authFinalizePath}`
      : forwardedHost
        ? `https://${forwardedHost}${authFinalizePath}`
        : `${origin}${authFinalizePath}`;

  if (code) {
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.redirect(new URL("/login", request.url));
}