import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Silence multiple lockfile warning by setting workspace root to v2-next
  outputFileTracingRoot: __dirname,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zuycsuajiuqsvopiioer.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cms.brandonptdavis.com",
      },
      {
        protocol: "http",
        hostname: "cms.brandonptdavis.com",
      },
      {
        protocol: "https",
        hostname: "static.wixstatic.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/resume.pdf",
        destination:
          "https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/about/Brandon-PT-Davis-Resume-2025.pdf",
      },
    ];
  },
};

export default nextConfig;
