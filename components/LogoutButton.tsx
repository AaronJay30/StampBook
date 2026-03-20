"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      startTransition(() => {
        router.push("/login");
        router.refresh();
      });
      setIsPending(false);
    }
  }

  return (
    <button
      className="rounded-full border border-[var(--paper-border)] bg-white px-4 py-2 text-sm font-bold text-foreground transition hover:bg-secondary disabled:opacity-60"
      onClick={handleLogout}
      type="button"
      disabled={isPending}
    >
      {isPending ? "Leaving..." : "Log Out"}
    </button>
  );
}
