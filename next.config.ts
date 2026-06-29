import type { NextConfig } from "next"

const CSP = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-eval' 'unsafe-inline' https:`,
  `style-src 'self' 'unsafe-inline' https:`,
  `img-src 'self' blob: data: https: https://pagead2.googlesyndication.com https://tpc.googlesyndication.com`,
  `font-src 'self' https:`,
  `connect-src 'self' https: http://localhost:* ws://localhost:* https://pagead2.googlesyndication.com`,
  `frame-src 'self' https://*.supabase.co https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://ep2.adtrafficquality.google https://www.google.com`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
].join("; ")

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "github.githubassets.com" },
      { protocol: "https", hostname: "www.google.com" },
      { protocol: "https", hostname: "docs.anthropic.com" },
      { protocol: "https", hostname: "docs.perplexity.ai" },
      { protocol: "https", hostname: "t0.gstatic.com" },
      { protocol: "https", hostname: "t1.gstatic.com" },
      { protocol: "https", hostname: "t2.gstatic.com" },
      { protocol: "https", hostname: "t3.gstatic.com" },
      { protocol: "https", hostname: "img.icons8.com" },
      { protocol: "https", hostname: "cryptologos.cc" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-DNS-Prefetch-Control", value: "on" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Content-Security-Policy", value: CSP },
      ],
    },
    {
      source: "/api/:path*",
      headers: [
        {
          key: "Access-Control-Allow-Origin",
          value: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        },
        { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
        { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, X-CSRF-Token" },
        { key: "Access-Control-Max-Age", value: "86400" },
      ],
    },
  ],
}

export default nextConfig
