/**
 * Server-only helpers for reading book/stamp data from Supabase.
 * Returns the same BookView shape that BookViewer expects.
 */
import { createSupabaseServerClient } from "@/lib/supabase";
import type { BookPageView, BookView, Profile, Stamp } from "@/lib/types";

/** Fetch a complete BookView for a user (by user id). Returns null if not found. */
export async function getBookViewByUserId(userId: string): Promise<BookView | null> {
  const supabase = await createSupabaseServerClient();

  // Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, bio, created_at")
    .eq("id", userId)
    .single();

  if (!profile) return null;

  const { data: authUser } = await supabase.auth.getUser();

  const owner: Profile = {
    id: profile.id as string,
    email: authUser?.user?.email ?? "",
    username: profile.username as string,
    avatarUrl: (profile.avatar_url as string | null) ?? null,
    bio: (profile.bio as string) ?? "",
    createdAt: profile.created_at as string,
  };

  // Book
  const { data: book } = await supabase
    .from("books")
    .select("id, title, is_public, created_at")
    .eq("user_id", userId)
    .single();

  if (!book) return null;

  return buildBookView(supabase, owner, book);
}

/** Fetch a public BookView by username. Returns null if not found or private. */
export async function getPublicBookByUsername(username: string): Promise<BookView | null> {
  const supabase = await createSupabaseServerClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, bio, created_at")
    .eq("username", username)
    .single();

  if (!profile) return null;

  const owner: Profile = {
    id: profile.id as string,
    email: "",
    username: profile.username as string,
    avatarUrl: (profile.avatar_url as string | null) ?? null,
    bio: (profile.bio as string) ?? "",
    createdAt: profile.created_at as string,
  };

  const { data: book } = await supabase
    .from("books")
    .select("id, title, is_public, created_at")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .single();

  if (!book) return null;

  return buildBookView(supabase, owner, book);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function buildBookView(supabase: any, owner: Profile, book: any): Promise<BookView> {
  // Pages
  const { data: pages } = await supabase
    .from("pages")
    .select("id, page_number, year, month")
    .eq("book_id", book.id)
    .order("page_number", { ascending: true });

  const pageList = (pages ?? []) as Array<{ id: string; page_number: number; year: number | null; month: number | null }>;

  // Grid slots + stamps for all pages in one query
  const pageIds = pageList.map((p) => p.id);
  let slots: Array<{ id: string; page_id: string; row: number; col: number; stamp_id: string }> = [];
  let stamps: Stamp[] = [];

  if (pageIds.length > 0) {
    const { data: slotData } = await supabase
      .from("grid_slots")
      .select("id, page_id, row, col, stamp_id")
      .in("page_id", pageIds);

    slots = (slotData ?? []) as typeof slots;

    const stampIds = slots.map((s) => s.stamp_id);
    if (stampIds.length > 0) {
      const { data: stampData } = await supabase
        .from("stamps")
        .select("id, user_id, image_url, shape, description, created_at")
        .in("id", stampIds);

      stamps = ((stampData ?? []) as Array<{
        id: string; user_id: string; image_url: string;
        shape: string; description: string; created_at: string;
      }>).map((s) => ({
        id: s.id,
        userId: s.user_id,
        imageUrl: s.image_url,
        shape: s.shape as Stamp["shape"],
        description: s.description,
        createdAt: s.created_at,
      }));
    }
  }

  const pageViews: BookPageView[] = pageList.map((p) => {
    const pageSlots = slots.filter((s) => s.page_id === p.id);
    return {
      id: p.id,
      pageNumber: p.page_number,
      year: p.year ?? undefined,
      month: p.month ?? undefined,
      slots: pageSlots.map((s) => ({
        id: s.id,
        index: s.row * 7 + s.col,
        row: s.row,
        column: s.col,
        stamp: stamps.find((st) => st.id === s.stamp_id) ?? null,
      })),
    };
  });

  return {
    book: {
      id: book.id as string,
      userId: owner.id,
      title: book.title as string,
      isPublic: book.is_public as boolean,
      createdAt: book.created_at as string,
    },
    owner,
    pages: pageViews,
  };
}
