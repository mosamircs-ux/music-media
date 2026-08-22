import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@musicmotion/ui",
    "@musicmotion/shared",
    "@musicmotion/music",
    "@musicmotion/video",
    "@musicmotion/ai",
    "@musicmotion/database",
    "remotion",
    "@remotion/player",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  webpack: (config) => {
    // Enable WebAssembly & audio decoding if needed
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    return config;
  },
};

export default nextConfig;
