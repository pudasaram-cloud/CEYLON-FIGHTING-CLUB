import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  async rewrites() {
    return [
      {
        source: "/dashboard",
        destination: "/",
      },
      {
        source: "/members",
        destination: "/",
      },
      {
        source: "/activities",
        destination: "/",
      },
      {
        source: "/reports",
        destination: "/",
      },
      {
        source: "/settings",
        destination: "/",
      },
      {
        source: "/login",
        destination: "/",
      },
    ];
  },
};

export default nextConfig;
