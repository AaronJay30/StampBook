"use client";

import Link from "next/link";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Lock, Mail, User } from "lucide-react";

interface AuthFormProps {
  mode: "login" | "register";
}

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Something went wrong.");

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
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-8">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-stone-400 opacity-20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-stone-300 opacity-20 blur-[120px]" />
      </div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-4xl overflow-hidden rounded-lg bg-[#FDFCF8]"
        initial={{ opacity: 0, y: 24 }}
        style={{ boxShadow: "0 4px 48px rgba(90,75,60,0.13), 0 1px 4px rgba(90,75,60,0.07)" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="relative flex h-full min-h-[520px] w-full overflow-hidden">
          {/* Left page — brand */}
          <div className="page-depth-left page-texture hidden flex-1 items-center justify-center overflow-hidden border-r border-stone-200/50 bg-[#F9F7F2] p-10 sm:flex">
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 opacity-30 spine-gradient" />
            <div className="relative z-10 space-y-6 text-center">
              <div className="inline-block rounded-full border border-stone-200/50 bg-stone-100/50 p-4">
                <BookOpen className="h-10 w-10 text-stone-600" />
              </div>
              <div className="space-y-3">
                <h1 className="font-serif text-5xl italic tracking-tight text-stone-800">
                  StampBook
                </h1>
                <div className="mx-auto h-px w-12 bg-stone-300" />
                <p className="mx-auto max-w-xs font-serif text-lg leading-relaxed text-stone-500">
                  &ldquo;Every stamp is a memory pressed into paper.&rdquo;
                </p>
              </div>
            </div>
            <div className="absolute top-6 left-6 h-14 w-14 rounded-tl-md border-t border-l border-stone-200" />
            <div className="absolute right-6 bottom-6 h-14 w-14 rounded-br-md border-r border-b border-stone-200" />
          </div>

          {/* Right page — form */}
          <div className="page-depth-right page-texture flex flex-1 flex-col justify-center border-l border-stone-200/50 bg-[#FDFCF8] p-6 sm:p-10">
            <div className="pointer-events-none absolute inset-y-0 left-0 hidden h-12 w-12 opacity-20 sm:block spine-gradient" />
            <div className="relative z-10 mx-auto w-full max-w-sm space-y-5">
              <div>
                <h2 className="font-serif text-3xl text-stone-800">
                  {mode === "login" ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="mt-1 text-xs font-light text-stone-500">
                  {mode === "login"
                    ? "Sign in to your stamp collection."
                    : "Start your stamp journey today."}
                </p>
              </div>

              <form
                className="space-y-4"
                action={(formData) => {
                  void handleSubmit(formData);
                }}
              >
                {mode === "register" ? (
                  <div className="group relative">
                    <User className="absolute top-1/2 left-0 h-4 w-4 -translate-y-1/2 text-stone-400 transition-colors group-focus-within:text-stone-700" />
                    <input
                      className="w-full border-b border-stone-200 bg-transparent py-2 pl-8 pr-4 text-sm font-light text-stone-700 outline-none transition-all placeholder:text-stone-300 focus:border-stone-800"
                      maxLength={20}
                      minLength={3}
                      name="username"
                      pattern="[a-z0-9_]+"
                      placeholder="Username (e.g. sakura_collector)"
                      required
                      type="text"
                    />
                  </div>
                ) : null}

                <div className="group relative">
                  <Mail className="absolute top-1/2 left-0 h-4 w-4 -translate-y-1/2 text-stone-400 transition-colors group-focus-within:text-stone-700" />
                  <input
                    className="w-full border-b border-stone-200 bg-transparent py-2 pl-8 pr-4 text-sm font-light text-stone-700 outline-none transition-all placeholder:text-stone-300 focus:border-stone-800"
                    name="email"
                    placeholder="Email Address"
                    required
                    type="email"
                  />
                </div>

                <div className="group relative">
                  <Lock className="absolute top-1/2 left-0 h-4 w-4 -translate-y-1/2 text-stone-400 transition-colors group-focus-within:text-stone-700" />
                  <input
                    className="w-full border-b border-stone-200 bg-transparent py-2 pl-8 pr-4 text-sm font-light text-stone-700 outline-none transition-all placeholder:text-stone-300 focus:border-stone-800"
                    minLength={8}
                    name="password"
                    placeholder="Password (min 8 characters)"
                    required
                    type="password"
                  />
                </div>

                {error ? (
                  <p className="rounded bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>
                ) : null}

                <motion.button
                  className="flex w-full items-center justify-center gap-2 rounded-sm bg-stone-800 py-3 font-serif text-base tracking-wide text-stone-50 shadow-lg shadow-stone-200 transition-colors hover:bg-stone-900 disabled:opacity-60"
                  disabled={isPending}
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isPending ? "Saving…" : mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </form>

              <p className="text-center text-xs text-stone-400">
                {mode === "login" ? "No account yet?" : "Already registered?"}{" "}
                <Link
                  className="font-medium text-stone-800 underline-offset-4 hover:underline"
                  href={mode === "login" ? "/register" : "/login"}
                >
                  {mode === "login" ? "Sign up free" : "Log in here"}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
