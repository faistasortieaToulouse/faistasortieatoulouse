import type { NextConfig } from 'next';
import withPWA from 'next-pwa';
import runtimeCaching from 'next-pwa/cache'; // cache standard recommandé

const nextConfig: NextConfig = {
  // Ignore les erreurs TypeScript pendant le build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignore les erreurs ESLint pendant le build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configuration des images distantes autorisées
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
  // Configuration PWA
  pwa: {
    dest: 'public',               // le dossier où générer le service worker et le manifest
    register: true,               // auto enregistrement du SW
    skipWaiting: true,            // activate SW immédiatement
    disable: process.env.NODE_ENV === 'development', // désactiver en dev
    runtimeCaching,               // utilise le cache par défaut de next-pwa
  },
  // Autres options Next.js si nécessaire
  reactStrictMode: true,
};

export default withPWA(nextConfig);
