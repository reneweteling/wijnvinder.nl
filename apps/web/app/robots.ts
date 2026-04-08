import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/login", "/registreren", "/favorieten"],
    },
    sitemap: "https://wijnvinder.nl/sitemap.xml",
  };
}
