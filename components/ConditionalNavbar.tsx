"use client";

import { usePathname } from "next/navigation";

import { Navbar } from "@/components/Navbar";
import type { Profile } from "@/lib/types";

interface ConditionalNavbarProps {
  profile: Profile | null;
}

export function ConditionalNavbar({ profile }: ConditionalNavbarProps) {
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }
  return <Navbar profile={profile} />;
}
