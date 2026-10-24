import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  transpilePackages: ["editor", "store", "thaana-bidi"],
  allowedDevOrigins: ["192.168.18.21"],
};

export default nextConfig;
