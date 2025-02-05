import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["img.tripi.vn", "vtcpay.vn", "sdnmma.blob.core.windows.net"],
  },
};

export default withNextIntl(nextConfig);
