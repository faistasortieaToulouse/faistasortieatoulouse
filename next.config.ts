import type { NextConfig } from 'next';
import withPWA from 'next-pwa';
import runtimeCaching from 'next-pwa/cache'; // cache standard recommandé

// Next.js config de base
const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true, // OK ici, à la racine
  },
  eslint: {
    ignoreDuringBuilds: true, // OK ici, à la racine
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
      { protocol: 'http', hostname: 'bilingue31.free.fr', pathname: '/**' },
      { protocol: 'https', hostname: 'secure.meetupstatic.com', pathname: '/**' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com', pathname: '/**' },
    ],
  },
};

// On passe uniquement les options PWA reconnues à withPWA
export default withPWA({
  ...nextConfig,
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    runtimeCaching,
  },
});
