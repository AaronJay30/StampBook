import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      username?: string;
    };

    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";
    const username = (body.username ?? "").trim().toLowerCase();

    if (!username || !/^[a-z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json(
        { error: "Username must be 3-20 characters using lowercase letters, numbers, or underscores." },
        { status: 400 },
      );
    }

    const supabase = await createSupabaseServerClient();

    // Check username uniqueness before creating auth user
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Username is already taken." }, { status: 400 });
    }

    // Create auth user (trigger will create profile + book + page)
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data.user) {
      return NextResponse.json({ error: "Registration failed." }, { status: 400 });
    }

    // Set the chosen username on the profile (trigger creates a default one from email)
    await supabase
      .from("profiles")
      .update({ username })
      .eq("id", data.user.id);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to register right now.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
