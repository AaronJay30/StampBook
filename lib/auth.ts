import { createSupabaseServerClient } from "@/lib/supabase";
import type { Profile } from "@/lib/types";

export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, bio, created_at")
      .eq("id", user.id)
      .single();

    if (!profile) return null;

    return {
      id: profile.id as string,
      email: user.email ?? "",
      username: profile.username as string,
      avatarUrl: (profile.avatar_url as string | null) ?? null,
      bio: (profile.bio as string) ?? "",
      createdAt: profile.created_at as string,
    };
  } catch {
    return null;
  }
}
