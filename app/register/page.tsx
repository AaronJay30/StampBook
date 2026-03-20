import { redirect } from "next/navigation";

import { AuthForm } from "@/components/AuthForm";
import { getCurrentProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const profile = await getCurrentProfile();

  if (profile) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-6xl items-center px-6 py-10 sm:px-10 lg:px-12">
      <AuthForm mode="register" />
    </main>
  );
}
