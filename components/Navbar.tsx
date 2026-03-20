import Link from "next/link";

import type { Profile } from "@/lib/types";
import { LogoutButton } from "@/components/LogoutButton";

interface NavbarProps {
  profile: Profile | null;
}

export function Navbar({ profile }: NavbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--paper-border)] bg-white/75 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-10 lg:px-12">
        <Link className="text-lg font-extrabold tracking-[0.12em] text-accent uppercase" href={profile ? "/dashboard" : "/"}>
          StampBook 🌸
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          {profile ? (
            <>
              <Link className="rounded-full px-4 py-2 text-sm font-bold text-foreground transition hover:bg-secondary" href="/dashboard">
                Dashboard
              </Link>
              <Link
                className="rounded-full px-4 py-2 text-sm font-bold text-foreground transition hover:bg-secondary"
                href={`/book/${profile.username}`}
              >
                My Book
              </Link>
              <span className="hidden text-sm font-semibold text-foreground/70 sm:inline">@{profile.username}</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link className="rounded-full px-4 py-2 text-sm font-bold text-foreground transition hover:bg-secondary" href="/login">
                Log In
              </Link>
              <Link className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-foreground transition hover:brightness-[1.03]" href="/register">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
