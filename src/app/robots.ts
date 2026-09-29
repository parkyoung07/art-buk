import { MetadataRoute } from "next";

export const dynamic = "force-static";

const SITE_URL = "https://nadriai.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/*", "/api/admin/*", "/api/*"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
