import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Log in to create a stamp." }, { status: 401 });
    }

    const body = (await request.json()) as {
      column?: number;
      description?: string;
      imageUrl?: string;
      pageId?: string;
      row?: number;
      shape?: "square" | "circle" | "heart" | "star" | "stamp_edge";
    };

    // Insert stamp
    const { data: stamp, error: stampError } = await supabase
      .from("stamps")
      .insert({
        user_id: user.id,
        image_url: body.imageUrl ?? "",
        shape: body.shape ?? "stamp_edge",
        description: (body.description ?? "").slice(0, 280),
      })
      .select()
      .single();

    if (stampError) throw new Error(stampError.message);

    // Place in grid slot if target provided
    if (body.pageId !== undefined && body.row !== undefined && body.column !== undefined) {
      const { error: slotError } = await supabase
        .from("grid_slots")
        .upsert(
          { page_id: body.pageId, row: body.row, col: body.column, stamp_id: stamp.id },
          { onConflict: "page_id,row,col" },
        );
      if (slotError) throw new Error(slotError.message);
    }

    return NextResponse.json({ stamp }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to create the stamp.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Log in to update your book." }, { status: 401 });
    }

    const body = (await request.json()) as { stampId?: string };

    if (!body.stampId) {
      return NextResponse.json({ error: "Stamp id is required." }, { status: 400 });
    }

    const { error } = await supabase
      .from("stamps")
      .delete()
      .eq("id", body.stampId)
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to remove the stamp.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
