import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for GitHub Pages
  output: "export",
  
  // Set basePath for GitHub Pages (repo name)
  // Disabled for local development - uncomment for production build
  // basePath: "/us-visa-nav",
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
