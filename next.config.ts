import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,

  // This is to overcome hydration issues caused by browser extensions like Grammarly
  // that inject attributes into the DOM before React hydration
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 4,
  },

  // Disable React's hydration warnings in development
  // This won't affect production builds but will help during development
  compiler: {
    // Suppress hydration warnings that are caused by browser extensions
    reactRemoveProperties: process.env.NODE_ENV === 'production'
      ? { properties: ['^data-gr-.*$'] }
      : false,
  },
};

export default nextConfig;
