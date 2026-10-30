import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  transpilePackages: ["editor", "spellcheck", "store", "thaana-bidi"],
  allowedDevOrigins: ["192.168.18.11"],
};

export default nextConfig;
