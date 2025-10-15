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
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ['react-apexcharts', 'apexcharts'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: 
              "default-src 'self';" +
              " script-src 'self' 'unsafe-eval' 'unsafe-inline';" +
              " style-src 'self' 'unsafe-inline' fonts.googleapis.com;" +
              " font-src 'self' fonts.gstatic.com;" +
              // Menambahkan domain gambar dan backend
              " img-src 'self' data: randomuser.me firebasestorage.googleapis.com lalapan-depok.com fe-simkesling.lalapan-depok.com simkesling-depok.com simkesling.com;" +
              " connect-src 'self' https://be-simkesling.lalapan-depok.com http://localhost:8000;" +
              " frame-ancestors 'none';",
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;