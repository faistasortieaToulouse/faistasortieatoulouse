// pages/_app.tsx

import type { AppProps } from 'next/app';
import Script from 'next/script'; // Importez le composant Script

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* 1. Script AdSense Global (à placer dans le <head> ou avant la fermeture du <body>) */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=VOTRE_ID_ADSENSE_PUB" // REMPLACER VOTRE_ID_ADSENSE_PUB
        crossOrigin="anonymous"
        strategy="afterInteractive" // Charge après l'hydratation de la page
      />

      {/* 2. Votre Composant de Layout Global */}
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

export default MyApp;

// NOTE : Votre composant de Layout (où nous allons placer la bannière) doit envelopper <Component />
