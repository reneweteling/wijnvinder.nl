import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep private, transactional and non-content routes out of the index.
      disallow: [
        "/api/",
        "/uit/",
        "/admin",
        "/login",
        "/registreren",
        "/wachtwoord-vergeten",
        "/wachtwoord-resetten",
        "/favorieten",
        "/profiel",
        "/stats",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
