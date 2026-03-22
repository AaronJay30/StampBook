import { redirect } from "next/navigation";

import { AuthForm } from "@/components/AuthForm";
import { getCurrentProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const profile = await getCurrentProfile();

  if (profile) {
    redirect("/dashboard");
  }

  return <AuthForm mode="login" />;
}
