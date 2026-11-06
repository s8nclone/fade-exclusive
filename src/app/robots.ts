import type { MetadataRoute } from "next";

/**
 * Public robots.txt (Section 4.3 & 18).
 * IMPORTANT: Never mention the secret ADMIN_PATH_SLUG here because listing it
 * in Disallow would publicly reveal the hidden admin path!
 * Admin pages enforce `X-Robots-Tag: noindex, nofollow` via response headers.
 */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/order/", "/receipt/", "/checkout"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
