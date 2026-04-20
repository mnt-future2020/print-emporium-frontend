/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // Configuration remains standard for Next.js 16

  images: {
    // Enable default image optimization for better performance (requires sharp)
    unoptimized: false,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "i.pravatar.cc", pathname: "/**" },
    ],
  },

  // Optimized caching strategy:
  // We allow short caching for HTML to prevent ChunkLoadError while enabling 
  // browser's natural prefetching and caching capabilities.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            // Allow browser caching for 10 seconds, but require revalidation after that.
            // This is a safe balance for Hostinger and similar shared hosting.
            value: 'public, max-age=10, must-revalidate',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
