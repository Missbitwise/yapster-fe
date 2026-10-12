const backendUrl =
  process.env.BACKEND_URL || "https://yapster-be.onrender.com";

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com", "api.dicebear.com"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

