import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        {/* Encodage UTF-8 */}
        <meta charSet="UTF-8" />

        {/* Viewport pour mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Politique de sécurité recommandée */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* Optionnel : favicon */}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        {/* Contenu principal */}
        <Main />

        {/* Scripts Next.js */}
        <NextScript />

        {/* Cloudflare Turnstile: chargé ici si besoin pour toutes les pages */}
        {/* 
        <script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          async
          defer
        ></script> 
        */}
      </body>
    </Html>
  );
}
