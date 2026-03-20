import { cookies } from "next/headers";

import { getFoundationStore } from "@/lib/foundation-store";

export const SESSION_COOKIE = "stampbook_session";

export async function getCurrentProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const profile = getFoundationStore().getUserBySession(token);

  return profile;
}
