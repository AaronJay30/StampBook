"use client";

import { useState } from "react";

import { StampGrid } from "@/components/StampGrid";
import type { BookView } from "@/lib/types";

interface BookViewerProps {
  bookView: BookView;
  readOnly?: boolean;
}

export function BookViewer({ bookView, readOnly = false }: BookViewerProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const page = bookView.pages[pageIndex];

  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--paper-border)] bg-paper/90 p-6 shadow-[var(--shadow-soft)] backdrop-blur md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold tracking-[0.2em] text-accent uppercase">
            {readOnly ? `Public Book • @${bookView.owner.username}` : "Your Stamp Book"}
          </p>
          <h2 className="mt-2 text-3xl font-extrabold">{bookView.book.title}</h2>
          <p className="mt-2 text-sm text-foreground/70">
            Page {pageIndex + 1} of {bookView.pages.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-full border border-[var(--paper-border)] bg-white px-4 py-2 text-sm font-bold text-foreground transition hover:bg-secondary disabled:opacity-50"
            disabled={pageIndex === 0}
            onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
            type="button"
          >
            Prev
          </button>
          <button
            className="rounded-full border border-[var(--paper-border)] bg-white px-4 py-2 text-sm font-bold text-foreground transition hover:bg-secondary disabled:opacity-50"
            disabled={pageIndex === bookView.pages.length - 1}
            onClick={() => setPageIndex((current) => Math.min(bookView.pages.length - 1, current + 1))}
            type="button"
          >
            Next
          </button>
        </div>
      </div>

      <div className="mt-6">
        <StampGrid page={page} readOnly={readOnly} />
      </div>
    </section>
  );
}
