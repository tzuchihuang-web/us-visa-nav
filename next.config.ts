import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for GitHub Pages
  output: "export",
  
  // Set basePath for GitHub Pages (repo name)
  // Only set basePath in production, not in development
  basePath: process.env.NODE_ENV === "production" ? "/us-visa-nav" : "",
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
