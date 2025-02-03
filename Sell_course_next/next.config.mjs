import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin();
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
        domains: ['sdnmma.blob.core.windows.net'], // Add the domain for your image source
      },
};
 
export default withNextIntl(nextConfig);