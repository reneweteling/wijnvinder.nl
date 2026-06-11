import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "viavina.nl" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "www.wijnvoordeel.nl" },
      { protocol: "https", hostname: "www.dewijngoeroe.nl" },
      { protocol: "https", hostname: "www.topdrinks.nl" },
      { protocol: "https", hostname: "www.wijnbeurs.nl" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
