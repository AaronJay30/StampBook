import Link from "next/link";
import { redirect } from "next/navigation";

import { BookViewer } from "@/components/BookViewer";
import { StampStudio } from "@/components/StampStudio";
import { getCurrentProfile } from "@/lib/auth";
import { getFoundationStore } from "@/lib/foundation-store";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  const bookView = getFoundationStore().getBookViewByUserId(profile.id);

  if (!bookView) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8 sm:px-10 lg:px-12">
      <section className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="rounded-[var(--radius-card)] border border-[var(--paper-border)] bg-white/85 p-6 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-bold tracking-[0.2em] text-accent uppercase">Profile</p>
          <h1 className="mt-3 text-3xl font-extrabold">Hi, @{profile.username}</h1>
          <p className="mt-3 text-sm leading-7 text-foreground/75">
            Your scrapbook grows one stamp at a time. Every new stamp lands in the next open slot automatically.
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-[1.4rem] bg-secondary/60 p-4">
              <dt className="font-semibold text-foreground/65">Pages</dt>
              <dd className="mt-2 text-2xl font-extrabold">{bookView.pages.length}</dd>
            </div>
            <div className="rounded-[1.4rem] bg-secondary/60 p-4">
              <dt className="font-semibold text-foreground/65">Public Link</dt>
              <dd className="mt-2 text-sm font-bold text-accent">
                <Link href={`/book/${profile.username}`}>/book/{profile.username}</Link>
              </dd>
            </div>
          </dl>
        </aside>

        <StampStudio />
      </section>

      <BookViewer bookView={bookView} />
    </main>
  );
}
