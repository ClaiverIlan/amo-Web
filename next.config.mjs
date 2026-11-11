/** @type {import('next').NextConfig} */

const isDevelopment = process.env.NODE_ENV === "development";

const backendUrl = isDevelopment
  ? "http://127.0.0.1:8000"
  : "https://amo-backend-aa73.onrender.com";

const nextConfig = {
  skipTrailingSlashRedirect: true,

  async rewrites() {
    return [
      {
        source: "/api/backend/:path*/",
        destination: `${backendUrl}/:path*/`,
      },
      {
        source: "/api/backend/:path*",
        destination: `${backendUrl}/:path*/`,
      },
    ];
  },
};

export default nextConfig;