import type { Metadata } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import "./globals.css";

const mPlusRounded = M_PLUS_Rounded_1c({
  variable: "--font-m-plus-rounded",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "StampBook Social",
  description: "A scrapbook-style social platform for collecting and sharing stamp memories.",
};
import { ConditionalNavbar } from "@/components/ConditionalNavbar";
import { getCurrentProfile } from "@/lib/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getCurrentProfile();

  return (
    <html
      lang="en"
      className={`${mPlusRounded.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans text-foreground antialiased" suppressHydrationWarning>
        <ConditionalNavbar profile={profile} />
        {children}
      </body>
    </html>
  );
}
