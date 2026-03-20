import { NextResponse } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth";
import { getFoundationStore } from "@/lib/foundation-store";

function getSessionToken(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
    ?.split("=")[1];
}

export async function POST(request: Request) {
  try {
    const token = getSessionToken(request);
    const user = getFoundationStore().getUserBySession(token);

    if (!user) {
      return NextResponse.json({ error: "Log in to create a stamp." }, { status: 401 });
    }

    const body = (await request.json()) as {
      description?: string;
      imageUrl?: string;
      shape?: "square" | "circle" | "heart" | "star" | "stamp_edge";
    };

    const result = getFoundationStore().createStamp({
      userId: user.id,
      imageUrl: body.imageUrl ?? "",
      shape: body.shape ?? "stamp_edge",
      description: body.description ?? "",
    });

    return NextResponse.json({ stamp: result.stamp, slot: result.slot }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create the stamp.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
