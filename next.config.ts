import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@electric-sql/pglite"],
  outputFileTracingIncludes: { "/**": ["./demo/demo.tar.gz"] },
  // Each build worker boots its own embedded Postgres when DATABASE_URL is unset.
  experimental: { cpus: 2 },
};

export default nextConfig;
