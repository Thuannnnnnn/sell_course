import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin();
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["img.tripi.vn", 'vtcpay.vn'],
  },
};
 
export default withNextIntl(nextConfig);