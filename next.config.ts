import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.ufs.sh",
        pathname: "/f/**",
      },
      {
        // eMAG product images used by the demo seed data.
        protocol: "https",
        hostname: "s13emagst.akamaized.net",
        pathname: "/products/**",
      },
    ],
  },
};

export default nextConfig;
