import { notFound } from "next/navigation";

import { BookViewer } from "@/components/BookViewer";
import { getPublicBookByUsername } from "@/lib/db";

export const dynamic = "force-dynamic";

interface BookPageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function PublicBookPage({ params }: BookPageProps) {
  const { username } = await params;
  const bookView = await getPublicBookByUsername(username);

  if (!bookView) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 sm:px-10 lg:px-12">
      <section className="rounded-[var(--radius-card)] border border-[var(--paper-border)] bg-white/85 p-6 shadow-[var(--shadow-soft)]">
        <p className="text-sm font-bold tracking-[0.2em] text-accent uppercase">Shared Stamp Book</p>
        <h1 className="mt-3 text-4xl font-extrabold">@{bookView.owner.username}&apos;s memories</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-foreground/75">
          This public scrapbook shows the stamps saved in {bookView.owner.username}&apos;s collection.
        </p>
      </section>

      <BookViewer bookView={bookView} readOnly />
    </main>
  );
}
