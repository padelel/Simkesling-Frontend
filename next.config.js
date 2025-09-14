/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webp: {
    preset: "default",
    quality: 100,
  },
  images: {
    domains: [
      "randomuser.me",
      "firebasestorage.googleapis.com",
      "lalapan-depok.com",
      "fe-simkesling.lalapan-depok.com",
      "simkesling-depok.com",
      "simkesling.com",
    ],
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
