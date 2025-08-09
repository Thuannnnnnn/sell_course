/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Existing simple domains list
    domains: ['sdnmma.blob.core.windows.net', 'example.com'],
    // Add remote patterns for better flexibility (incl. subpaths & protocols)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sdnmma.blob.core.windows.net',
        port: '',
        pathname: '/**',
      },
      // Optionally allow your API / CDN host from env (if provided)
      ...(process.env.NEXT_PUBLIC_API_ASSET_HOST
        ? [{
            protocol: process.env.NEXT_PUBLIC_API_ASSET_PROTOCOL || 'https',
            hostname: process.env.NEXT_PUBLIC_API_ASSET_HOST,
            port: process.env.NEXT_PUBLIC_API_ASSET_PORT || '',
            pathname: '/**',
          }]
        : []),
    ],
  },
};
export default nextConfig;
