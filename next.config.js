/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  target: 'experimental-serverless-trace',
  images: {
    domains: ['images.ctfassets.net'],
  },
};

module.exports = nextConfig;
