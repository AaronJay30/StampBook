"use client";

import Link from "next/link";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthFormProps {
  mode: "login" | "register";
}

const copy = {
  login: {
    title: "Welcome back to your stamp book",
    submit: "Log In",
    helper: "Need an account?",
    href: "/register",
    hrefLabel: "Create one",
  },
  register: {
    title: "Create your first scrapbook profile",
    submit: "Register",
    helper: "Already registered?",
    href: "/login",
    hrefLabel: "Log in",
  },
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);

    const payload = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      username: String(formData.get("username") ?? ""),
    };

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }

      startTransition(() => {
        router.push("/dashboard");
        router.refresh();
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-md rounded-[var(--radius-card)] border border-[var(--paper-border)] bg-white/90 p-8 shadow-[var(--shadow-soft)] backdrop-blur">
      <p className="text-sm font-bold tracking-[0.2em] text-accent uppercase">StampBook Social</p>
      <h1 className="mt-3 text-3xl font-extrabold">{copy[mode].title}</h1>
      <form
        className="mt-6 space-y-4"
        action={(formData) => {
          void handleSubmit(formData);
        }}
      >
        {mode === "register" ? (
          <label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
            Username
            <input
              className="rounded-2xl border border-[var(--paper-border)] bg-white px-4 py-3 outline-none ring-0 transition focus:border-accent"
              name="username"
              placeholder="sakura_collector"
              required
              minLength={3}
              maxLength={20}
              pattern="[a-z0-9_]+"
            />
          </label>
        ) : null}

        <label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
          Email
          <input
            className="rounded-2xl border border-[var(--paper-border)] bg-white px-4 py-3 outline-none ring-0 transition focus:border-accent"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
          Password
          <input
            className="rounded-2xl border border-[var(--paper-border)] bg-white px-4 py-3 outline-none ring-0 transition focus:border-accent"
            name="password"
            type="password"
            placeholder="At least 8 chars, letters and numbers"
            required
            minLength={8}
          />
        </label>

        {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        <button
          className="w-full rounded-full bg-primary px-5 py-3 font-bold text-foreground transition hover:brightness-[1.03] disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Saving..." : copy[mode].submit}
        </button>
      </form>

      <p className="mt-5 text-sm text-foreground/70">
        {copy[mode].helper} <Link className="font-bold text-accent" href={copy[mode].href}>{copy[mode].hrefLabel}</Link>
      </p>
    </section>
  );
}
