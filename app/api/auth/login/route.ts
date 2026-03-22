import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: body.email ?? "",
      password: body.password ?? "",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to sign in right now.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
