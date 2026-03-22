import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Log in to add a page." }, { status: 401 });
    }

    const body = (await request.json()) as { year?: number; month?: number };
    const year = typeof body.year === "number" ? body.year : new Date().getFullYear();
    const month = typeof body.month === "number" ? body.month : new Date().getMonth();

    // Find the user's book
    const { data: book } = await supabase
      .from("books")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!book) {
      return NextResponse.json({ error: "Book not found." }, { status: 404 });
    }

    // Check if the month page already exists (avoids ON CONFLICT with partial index)
    const { data: existing } = await supabase
      .from("pages")
      .select("id, year, month, page_number")
      .eq("book_id", book.id)
      .eq("year", year)
      .eq("month", month)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ page: existing }, { status: 200 });
    }

    // Insert a new month page
    const { data: page, error } = await supabase
      .from("pages")
      .insert({ book_id: book.id, year, month, page_number: year * 12 + month })
      .select("id, year, month, page_number")
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ page }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to add a page.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
