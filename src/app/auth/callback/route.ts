import { type NextRequest, NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        return NextResponse.redirect(new URL(next, request.url));
      }
    }
  }

  return NextResponse.redirect(new URL("/login", request.url));
}