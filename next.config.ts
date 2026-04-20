import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    unoptimized: false,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      { protocol: "https", hostname: "i.pravatar.cc", pathname: "/**" },
    ],
  },

  // Short-lived HTML caching avoids ChunkLoadError while still letting the
  // browser prefetch and cache like normal.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=10, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
