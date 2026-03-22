"use client";

import Link from "next/link";
import { useState } from "react";
import type { Profile } from "@/lib/types";
import { LogoutButton } from "@/components/LogoutButton";

interface NavbarProps {
  profile: Profile | null;
}

export function Navbar({ profile }: NavbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ── Desktop / tablet nav — hidden below lg ── */}
      <header className="sticky top-0 z-20 hidden border-b border-[var(--paper-border)] bg-[#f4efe7]/95 backdrop-blur lg:block">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-10 lg:px-12">
          <Link className="text-lg font-extrabold tracking-[0.12em] text-accent uppercase" href={profile ? "/dashboard" : "/"}>
            StampBook
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            {profile ? (
              <>
                <Link className="rounded-full px-4 py-2 text-sm font-bold text-foreground transition hover:bg-secondary" href="/dashboard">
                  Dashboard
                </Link>
                <Link className="rounded-full px-4 py-2 text-sm font-bold text-foreground transition hover:bg-secondary" href={`/book/${profile.username}`}>
                  My Book
                </Link>
                <span className="hidden text-sm font-semibold text-foreground/70 sm:inline">@{profile.username}</span>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link className="rounded-full px-4 py-2 text-sm font-bold text-foreground transition hover:bg-secondary" href="/login">Log In</Link>
                <Link className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-foreground transition hover:brightness-[1.03]" href="/register">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ── Mobile FAB — visible only below lg ── */}
      <div className="lg:hidden">
        {open ? (
          <>
            {/* Backdrop */}
            <div
              aria-hidden="true"
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            {/* Menu card */}
            <div className="fixed right-5 bottom-20 z-50 min-w-[180px] overflow-hidden rounded-2xl border border-stone-200/60 bg-[#F9F7F2] shadow-xl">
              {profile ? (
                <>
                  <div className="border-b border-stone-100 px-5 py-3">
                    <p className="font-serif text-xs italic text-stone-400">@{profile.username}</p>
                  </div>
                  <Link
                    className="block px-5 py-3 font-serif text-sm text-stone-700 transition hover:bg-stone-50"
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    className="block px-5 py-3 font-serif text-sm text-stone-700 transition hover:bg-stone-50"
                    href={`/book/${profile.username}`}
                    onClick={() => setOpen(false)}
                  >
                    My Book
                  </Link>
                  <div className="border-t border-stone-100 px-4 py-2">
                    <LogoutButton />
                  </div>
                </>
              ) : (
                <>
                  <Link className="block px-5 py-3 font-serif text-sm text-stone-700 transition hover:bg-stone-50" href="/login" onClick={() => setOpen(false)}>Log In</Link>
                  <Link className="block px-5 py-3 font-serif text-sm text-stone-700 transition hover:bg-stone-50" href="/register" onClick={() => setOpen(false)}>Register</Link>
                </>
              )}
            </div>
          </>
        ) : null}

        {/* FAB button */}
        <button
          aria-label={open ? "Close menu" : "Open menu"}
          className="fixed right-5 bottom-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-stone-800 text-stone-100 shadow-lg transition hover:bg-stone-700 active:scale-95"
          onClick={() => setOpen((v) => !v)}
          type="button"
        >
          {open ? (
            <svg fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" viewBox="0 0 14 14" width="14">
              <path d="M2 2l10 10M12 2L2 12" />
            </svg>
          ) : (
            <svg fill="none" height="15" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" viewBox="0 0 15 15" width="15">
              <path d="M2 3.5h11M2 7.5h11M2 11.5h11" />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}

