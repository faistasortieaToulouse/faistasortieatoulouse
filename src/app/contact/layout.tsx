// Ce layout reste un composant serveur (pas de 'use client')
import MainLayout from "@/app/(main)/layout";
import { ReactNode } from "react";
import Script from "next/script";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <MainLayout>{children}</MainLayout>

      {/* --- Script Cloudflare Turnstile --- */}
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        async
        defer
      />
    </>
  );
}
