import { NextResponse } from "next/server";

import { getFoundationStore } from "@/lib/foundation-store";
import { SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      username?: string;
    };

    const result = getFoundationStore().registerUser({
      email: body.email ?? "",
      password: body.password ?? "",
      username: body.username ?? "",
    });

    const response = NextResponse.json({ profile: result.profile }, { status: 201 });
    response.cookies.set(SESSION_COOKIE, result.session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to register right now.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
