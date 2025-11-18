import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "occ-0-325-395.1.nflxso.net",
      },
      {
        protocol: "https",
        hostname: "**.nflxso.net",
      },
    ],
  },
};

export default nextConfig;
