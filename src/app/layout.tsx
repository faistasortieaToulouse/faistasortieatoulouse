import type { Metadata } from 'next';
import './globals.css';
import 'react-day-picker/dist/style.css';

import { Toaster } from '@/components/ui/toaster';
import { TranslateWrapper } from '@/components/TranslateWrapper';

export const metadata: Metadata = {
  title: 'Toulouse Outings',
  description: 'Application pour faire des sorties à Toulouse',
  icons: {
    icon: '/icons/favicon.ico',
    shortcut: '/icons/favicon.ico',
    apple: '/icons/logoFTS180iphone.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className="h-full w-full overflow-x-hidden">
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />

        {/* Meta PWA / iOS */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FTST" />
        <meta name="theme-color" content="#2563eb" />

        {/* Logo iOS */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/logoFTS180iphone.png" />

        {/* Manifest PWA */}
        <link rel="manifest" href="/manifest.json" />
      </head>

      <body className="font-body antialiased">
        {children}

        {/* Wrapper pour la traduction */}
        <TranslateWrapper />

        {/* Toaster pour les notifications */}
        <Toaster />
      </body>
    </html>
  );
}
