import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.dirname(new URL(import.meta.url).pathname),
  },
  serverExternalPackages: [
    "pg",
    "@prisma/adapter-pg",
    "pdf-parse",
    "pdfjs-dist",
  ],
};

export default nextConfig;
