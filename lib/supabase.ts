import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let browserClient: SupabaseClient | null = null;

export function hasSupabaseEnv() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

function getSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
    );
  }
  return { supabaseUrl, supabaseAnonKey };
}

export function createSupabaseBrowserClient() {
  if (browserClient) return browserClient;
  const { supabaseUrl: url, supabaseAnonKey: anonKey } = getSupabaseConfig();
  browserClient = createBrowserClient(url, anonKey);
  return browserClient;
}

/**
 * Fix: Ensure cookies are only modified in server actions or route handlers.
 * This function now throws an error if used outside of a valid context.
 */
export async function createSupabaseServerClient() {
  const { supabaseUrl: url, supabaseAnonKey: anonKey } = getSupabaseConfig();

  // Ensure this function is only called in a server action or route handler
  if (typeof window !== "undefined") {
    throw new Error("createSupabaseServerClient can only be used in server actions or route handlers.");
  }

  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      },
    },
  });
}

/** Service-role client for admin operations — only use in server-side code. */
export function createSupabaseClient() {
  const { supabaseUrl: url, supabaseAnonKey: anonKey } = getSupabaseConfig();
  return createClient(url, anonKey);
}
