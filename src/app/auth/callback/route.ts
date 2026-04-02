import { type NextRequest, NextResponse } from "next/server";
import { saveGoogleOAuthTokens } from "@/lib/auth/oauthTokens";
import { createServer } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const forwardedHost = request.headers.get("x-forwarded-host");
  let next = searchParams.get("next") ?? "/";

  if (!next.startsWith("/")) {
    next = "/";
  }

  if (code) {
    const supabase = await createServer();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      await saveGoogleOAuthTokens(data.session);

      if (process.env.NODE_ENV === "development") {
        return NextResponse.redirect(`${origin}${next}`);
      }

      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(new URL("/login", request.url));
}