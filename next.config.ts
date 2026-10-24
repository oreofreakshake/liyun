import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  transpilePackages: ["editor", "store", "thaana-bidi"],
};

export default nextConfig;
