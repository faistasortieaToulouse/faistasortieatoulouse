// faistasortietest2/src/components/MainLayout.tsx
'use client';

import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Footer } from '@/components/footer';
import Script from 'next/script';

export function GoogleTranslateWidget() {
  return (
    <>
      <div id="google_translate_element" />
      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
      <Script id="google-translate-init" strategy="afterInteractive">
        {`
          function googleTranslateElementInit() {
            new google.translate.TranslateElement(
              {
                pageLanguage: 'fr',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE
              },
              'google_translate_element'
            );
          }
        `}
      </Script>
    </>
  );
}

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          {/* HEADER : Ajout du SidebarTrigger pour ouvrir/fermer la barre latérale */}
          <header className="relative z-10 flex justify-between p-2 bg-background shadow-sm">
            {/* 1. Bouton Menu Burger */}
            <SidebarTrigger />
            
            {/* 2. Google Translate (aligné à droite) */}
            <div className="w-48">
              <GoogleTranslateWidget />
            </div>
          </header>

          <div className="flex-grow">{children}</div>
          <Footer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
