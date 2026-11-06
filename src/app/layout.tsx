import type { Metadata } from "next";
import "@/styles/globals.css";
import { AppProviders } from "@/containers/providers/AppProviders";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "Fadé Exclusives — African Luxury & Contemporary Fashion House",
    template: "%s | Fadé Exclusives",
  },
  description:
    "Fadé Exclusives creates fashion at the intersection of African identity, contemporary design and modern luxury. Hand-crafted Agbadas, Senator Sets, Kaftans, and Bespoke Custom Fit from our Maitama, Abuja Atelier.",
  icons: {
    icon: [
      { url: "/brand/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/logo-mark.jpg", type: "image/jpeg" },
    ],
    shortcut: ["/brand/favicon.svg", "/brand/logo-mark.jpg"],
    apple: [{ url: "/brand/logo-mark.jpg", type: "image/jpeg" }],
  },
  openGraph: {
    type: "website",
    siteName: "Fadé Exclusives",
    title: "Fadé Exclusives — Brand & Growth Portfolio 2026",
    description:
      "African luxury. Contemporary expression. Thoughtfully designed in Abuja, Nigeria.",
    images: ["/brand/logo-full.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Fadé Exclusives",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/brand/logo-full.jpg`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Plot 1042, Ademola Adetokunbo Crescent, Maitama",
      addressLocality: "Abuja",
      addressRegion: "FCT",
      addressCountry: "NG",
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
