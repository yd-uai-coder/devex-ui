import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    // Prevents Next.js from misdetecting an unrelated ancestor directory
    // (one that happens to contain its own package-lock.json) as the
    // workspace root, which otherwise causes duplicate React copies.
    root: path.dirname(fileURLToPath(import.meta.url)),
  },
};

export default nextConfig;
