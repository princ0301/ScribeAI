/** @type {import('next').NextConfig} */
// Use a loose any-based type to avoid requiring webpack types in environments without the package
type Configuration = any;
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  webpack: (config: Configuration) => {
    const entry = {
      'utf-8-validate': 'commonjs utf-8-validate',
      bufferutil: 'commonjs bufferutil',
    };

    if (!config.externals) {
      config.externals = [entry];
    } else if (Array.isArray(config.externals)) {
      config.externals.push(entry);
    } else {
      // preserve existing externals (object/function) and append the entry
      config.externals = [config.externals as any, entry];
    }

    return config;
  },
  },
};

module.exports = nextConfig;