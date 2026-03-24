/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow reading files from the parent directory (outputs, memory, agents, etc.)
  experimental: {
    serverComponentsExternalPackages: ['gray-matter'],
  },
}

module.exports = nextConfig
