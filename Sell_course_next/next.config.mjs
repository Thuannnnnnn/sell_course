import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: "commonjs canvas" }];
    return config;
  },
  images: {
    domains: ["lh3.googleusercontent.com"],
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sdnmma.blob.core.windows.net",
      },
    ],
  },
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
