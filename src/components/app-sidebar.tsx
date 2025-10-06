// faistasortietest2/src/components/MainLayout.tsx

import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'; // <-- Import de SidebarTrigger
import { AppSidebar } from '@/components/app-sidebar';
import { Footer } from '@/components/footer';
import { GoogleTranslateWidget } from '@/components/google-translate-widget';

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
             {/* 1. Bouton Menu Burger (visible sur tous les écrans) */}
             <SidebarTrigger /> {/* Retire l'ancienne classe md:hidden pour qu'il soit toujours visible */}
             
             {/* 2. Google Translate (Aligné à droite) */}
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
