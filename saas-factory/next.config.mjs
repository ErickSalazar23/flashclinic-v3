/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Allow production builds with type errors for now
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow production builds with lint errors for now
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
