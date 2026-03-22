import { redirect } from "next/navigation";

import { BookViewer } from "@/components/BookViewer";
import { getCurrentProfile } from "@/lib/auth";
import { getBookViewByUserId } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  const bookView = await getBookViewByUserId(profile.id);

  if (!bookView) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-start justify-center px-4 py-6 sm:px-8 lg:px-10">
      <BookViewer bookView={bookView} />
    </main>
  );
}
