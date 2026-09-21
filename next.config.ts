import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every docs page is also available as raw markdown at /docs/<page>.md
  async rewrites() {
    return [{ source: "/docs/:slug.md", destination: "/docs/raw/:slug" }];
  },
};

export default nextConfig;
