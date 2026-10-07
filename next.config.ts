import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  images: {
    domains: ["fastly.picsum.photos"],
  },
};

export default nextConfig;
