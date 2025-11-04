'use client';

import type { ReactNode } from 'react';
import { SidebarProvider } from '@/context/SidebarContext';
import { AppSidebar } from '@/components/app-sidebar';
import { Footer } from '@/components/footer';
import GoogleTranslate from '@/components/GoogleTranslate';
import { SidebarTrigger } from '@/components/ui/sidebar'; // si tu veux garder ce composant

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main content */}
        <div className="flex flex-col flex-grow">
          {/* Header */}
          <header className="relative z-10 flex justify-between items-center p-2 bg-background shadow-sm">
            {/* Menu burger */}
            <SidebarTrigger />

            {/* Google Translate */}
            <div className="w-48">
              <GoogleTranslate />
            </div>
          </header>

          {/* Page content */}
          <main className="flex-grow">{children}</main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}
