import Link from "next/link";

import { getCurrentProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const profile = await getCurrentProfile();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-10 sm:px-10 lg:px-12">
      <section className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
        <div className="rounded-[var(--radius-card)] border border-[var(--paper-border)] bg-paper/90 p-8 shadow-[var(--shadow-soft)] backdrop-blur md:p-12">
          <span className="inline-flex rounded-full bg-white/80 px-4 py-2 text-sm font-bold tracking-[0.2em] text-accent uppercase">
            Phase 1 Foundation
          </span>
          <h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Build a scrapbook of stamp-shaped memories you can keep and share.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-foreground/80">
            The experience now opens like a rough paper journal: you sign in, click a square, upload a photo, and move the stamp over a steady image before it presses into the page.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="rounded-full bg-primary px-5 py-3 text-sm font-bold text-foreground shadow-[var(--shadow-soft)] transition hover:brightness-[1.03]" href={profile ? "/dashboard" : "/register"}>
              {profile ? "Open Dashboard" : "Start Your Book"}
            </Link>
            <Link className="rounded-full bg-white px-5 py-3 text-sm font-bold text-foreground shadow-[var(--shadow-soft)] transition hover:bg-secondary" href={profile ? `/book/${profile.username}` : "/login"}>
              {profile ? "View Public Book" : "Log In"}
            </Link>
          </div>
        </div>

        <aside className="rounded-[var(--radius-card)] border border-[var(--paper-border)] bg-white/85 p-6 shadow-[var(--shadow-soft)] backdrop-blur">
          <h2 className="text-2xl font-extrabold">Setup Snapshot</h2>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-foreground/80">
            <li>Authentication and session cookies are working in local foundation mode</li>
            <li>Stamp creation uses the real public stamp PNG with the green screen removed and the stamp window shape copied to export</li>
            <li>Books auto-create pages when all 12 slots are filled</li>
            <li>Public share pages are available at /book/username</li>
          </ul>
        </aside>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-[var(--radius-card)] border border-[var(--paper-border)] bg-white/80 p-6 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-bold tracking-[0.2em] text-accent uppercase">Current Focus</p>
          <h2 className="mt-3 text-2xl font-extrabold">Foundation</h2>
          <p className="mt-3 text-sm leading-7 text-foreground/80">
            The dashboard, book viewer, and stamp studio are ready for Phase 2 polish and the Phase 3 social layer.
          </p>
        </article>

        <article className="rounded-[var(--radius-card)] border border-[var(--paper-border)] bg-white/80 p-6 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-bold tracking-[0.2em] text-accent uppercase">Environment</p>
          <h2 className="mt-3 text-2xl font-extrabold">Supabase Keys</h2>
          <p className="mt-3 text-sm leading-7 text-foreground/80">
            The app is structured to swap to Supabase-backed data once you provide credentials and migrations.
          </p>
        </article>

        <article className="rounded-[var(--radius-card)] border border-[var(--paper-border)] bg-white/80 p-6 shadow-[var(--shadow-soft)] md:col-span-2 xl:col-span-1">
          <p className="text-sm font-bold tracking-[0.2em] text-accent uppercase">Next Build Step</p>
          <h2 className="mt-3 text-2xl font-extrabold">Authentication</h2>
          <p className="mt-3 text-sm leading-7 text-foreground/80">
            Phase 2 can now focus on description and view modals, animations, sound, and page-flip polish without reworking the foundation.
          </p>
        </article>
      </section>
    </main>
  );
}
