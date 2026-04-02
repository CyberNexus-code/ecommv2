import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { saveGoogleOAuthTokens } from "@/lib/auth/oauthTokens";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const forwardedHost = request.headers.get("x-forwarded-host");
  let next = searchParams.get("next") ?? "/";

  if (!next.startsWith("/")) {
    next = "/";
  }

  const authFinalizePath = `/auth/finalize?next=${encodeURIComponent(next)}`;

  const redirectUrl =
    process.env.NODE_ENV === "development"
      ? `${origin}${authFinalizePath}`
      : forwardedHost
        ? `https://${forwardedHost}${authFinalizePath}`
        : `${origin}${authFinalizePath}`;

  if (code) {
    let response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.redirect(redirectUrl);
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      await saveGoogleOAuthTokens(data.session);
      return response;
    }
  }

  return NextResponse.redirect(new URL("/login", request.url));
}