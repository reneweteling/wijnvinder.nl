import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "wijnvoordeel.nl" },
      { protocol: "https", hostname: "**.wijnvoordeel.nl" },
      { protocol: "https", hostname: "wijnbeurs.nl" },
      { protocol: "https", hostname: "**.wijnbeurs.nl" },
      { protocol: "https", hostname: "gall.nl" },
      { protocol: "https", hostname: "**.gall.nl" },
      { protocol: "https", hostname: "static.gall.nl" },
      { protocol: "https", hostname: "vivino.com" },
      { protocol: "https", hostname: "images.vivino.com" },
    ],
  },
};

export default nextConfig;
