// src/app/contact/layout.tsx
import MainLayout from "@/app/(main)/layout";
import { ReactNode, useEffect, useState } from "react";
import Script from "next/script";

export default function Layout({ children }: { children: ReactNode }) {
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);

  return (
    <>
      {/* Main layout principal */}
      <MainLayout>{children}</MainLayout>

      {/* --- SCRIPT CLOUDFLARE TURNSTILE --- */}
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("Turnstile script chargé !");
          setTurnstileLoaded(true);
        }}
        async
        defer
      />
      {/* ----------------------------------- */}

      {/* Optionnel : log pour vérifier que le script est bien chargé */}
      {turnstileLoaded && (
        <script
          dangerouslySetInnerHTML={{
            __html: "console.log('window.turnstile:', window.turnstile);",
          }}
        />
      )}
    </>
  );
}
