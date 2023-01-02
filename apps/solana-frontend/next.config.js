const withTwin = require("./withTwin.js");

/**
 * @type {import('next').NextConfig}
 */
module.exports = withTwin({
  reactStrictMode: true,
  transpilePackages: ["ui"],
  typescript: {
    // !! WARN !!
    // Vercel doesn't play nice with anchor generated types
    // !! WARN !!
    ignoreBuildErrors: true,
  },
});
