import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Once code is exchanged, session cookies are set on the browser.
      // Redirect to /login where useEffect checkSession will read session,
      // save sessionStorage credentials, and route to dashboard/onboarding.
      return NextResponse.redirect(`${origin}/login`);
    }
    console.error("OAuth code exchange error:", error);
  }

  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
}
