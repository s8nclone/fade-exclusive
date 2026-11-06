import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isMatchingAdminSlug } from "@/server/auth";

/**
 * Hidden Admin Route Guard (Section 4.3 & 14.3).
 * Compares `[adminSlug]` against server-only `ADMIN_PATH_SLUG` using constant-time comparison.
 * Returns a standard 404 Not Found on mismatch so the admin URL is never revealed.
 */
export const metadata: Metadata = {
  title: "Atelier Command Center",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function AdminRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ adminSlug: string }>;
}) {
  const { adminSlug } = await params;

  if (!isMatchingAdminSlug(adminSlug)) {
    notFound();
  }

  return <>{children}</>;
}
