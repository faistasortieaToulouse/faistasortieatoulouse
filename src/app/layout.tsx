import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
// import GoogleTranslate from '@/components/GoogleTranslate'; // client component
import { TranslateWrapper } from '@/components/TranslateWrapper'; // ⬅️ IMPORT DU NOUVEAU WRAPPER

export const metadata: Metadata = {
  title: 'Toulouse Outings',
  description: 'Application pour faire des sorties à Toulouse',
  icons: {
    icon: '/icons/favicon.ico',            // ✅ Favicon pour PC / Windows
    shortcut: '/icons/favicon.ico',        // ✅ Icône de raccourci (Windows / Linux)
    apple: '/icons/logoFTS180iphone.png',  // ✅ Icône Apple (iOS / macOS)
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />

        {/* Meta PWA / iOS */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FTST" />
        <meta name="theme-color" content="#2563eb" />

        {/* Logo iOS */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/logoFTS180iphone.png" />

        {/* Manifest PWA */}
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-body antialiased min-h-screen">
        {children}

                {/* Le composant GoogleTranslate a été retiré pour éviter les conflits lors du pré-rendu, 
            car le widget est déjà intégré via GoogleTranslateWidget dans (main)/layout.tsx. */}
        {/* <GoogleTranslate /> */}
        {/* ✅ Active ton composant GoogleTranslate ici */}

        {/* ✅ AJOUT DU WRAPPER AVEC LA LOGIQUE DE CLÉ DYNAMIQUE */}
        {/* <TranslateWrapper /> */}

        <Toaster />
      </body>
    </html>
  );
}
