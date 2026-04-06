/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  typescript: {
    // Allows production builds to complete even if the project has type errors
    ignoreBuildErrors: true,
  },

  eslint: {
    // Ignore ESLint errors during builds
    ignoreDuringBuilds: true,
  },

  images: {
    // Disable default image optimization to save server resources on Hostinger
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "i.pravatar.cc", pathname: "/**" },
    ],
  },

  // CRITICAL: This prevents the 'ChunkLoadError' by telling browsers
  // to always fetch the latest version of the page instead of caching old HTML.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
