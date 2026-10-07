/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com", "api.dicebear.com"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://yapster-be.onrender.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;
