import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const nextConfig: NextConfig = withPWA({
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
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
  pwa: {
    dest: 'public', // dossier où le service worker et manifest seront générés
    register: true, // enregistre automatiquement le SW
    skipWaiting: true, // passe au SW suivant dès qu’il est installé
    disable: process.env.NODE_ENV === 'development', // désactive PWA en dev
  },
});

export default nextConfig;
