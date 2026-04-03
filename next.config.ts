import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "statehouse.gov.ng",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
