/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for the Docker standalone build — copies only the files
  // needed to run the app into .next/standalone (no node_modules bloat)
  output: "standalone",

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
