/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const isScan = process.env.SCAN_MODE === '1';

const cspNonce = process.env.CSP_NONCE || 'DEVSCAN123';
const imageDomains = [
  "randomuser.me",
  "firebasestorage.googleapis.com",
  "lalapan-depok.com",
  "fe-simkesling.lalapan-depok.com",
  "simkesling-depok.com",
  "simkesling.com",
];

const cspProd = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  `img-src 'self' data: ${imageDomains.join(' ')}`,
  "font-src 'self' fonts.gstatic.com data:",
  "style-src 'self' fonts.googleapis.com",
  "script-src 'self'",
  "connect-src 'self' https://be-simkesling.lalapan-depok.com",
].join('; ') + ';';

// Dev CSP: enumerating websocket hosts to avoid wildcard alerts
const cspDev = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  `img-src 'self' data: ${imageDomains.join(' ')}`,
  "font-src 'self' fonts.gstatic.com data:",
  "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
  // restrict websocket to explicit localhost ports used during dev
  "connect-src 'self' http://localhost:8000 ws://localhost:3001 ws://localhost:3002",
  "frame-ancestors 'none'",
].join('; ') + ';';

// Scan Mode (dev, but production-tight CSP): remove unsafe-* and use explicit connects
const cspScan = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  `img-src 'self' data: ${imageDomains.join(' ')}`,
  "font-src 'self' fonts.gstatic.com data:",
  `style-src 'self' 'nonce-${cspNonce}' fonts.googleapis.com`,
  "script-src 'self'",
  "connect-src 'self' http://localhost:3000 http://localhost:3001 http://localhost:3002 http://localhost:8000",
].join('; ') + ';';

const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  // Use a custom dist dir to avoid Windows EPERM locks on .next
  distDir: '.next-dev',
  images: {
    domains: imageDomains,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Disable output file tracing to avoid writing trace file on Windows
    outputFileTracing: false,
  },
  transpilePackages: ['react-apexcharts', 'apexcharts'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: isProd ? cspProd : (isScan ? cspScan : cspDev),
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
            key: 'Referrer-Policy',
            value: 'no-referrer',
          },
          ...(isProd ? [{
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          }] : [])
        ],
      },
    ];
  },
};

module.exports = nextConfig;

