// src/app/(main)/layout.tsx
'use client';

import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  useSidebar,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Footer } from '@/components/footer';
import { TranslateWrapper } from '@/components/TranslateWrapper';

function MainContent({ children }: { children: ReactNode }) {
  const { state } = useSidebar(); // "expanded" | "collapsed"
  // largeur du sidebar quand expanded = 16rem = 256px (défini par --sidebar-width)
  // largeur quand collapsed = icône rail (ici on met 48px), ou 0 si tu veux
  const expandedPx = 256;
  const collapsedPx = 48; // ajuste si tu veux 0

  const paddingLeft = state === 'collapsed' ? collapsedPx : expandedPx;

  return (
    <div
      style={{ paddingLeft, transition: 'padding-left 240ms ease' }}
      className="min-h-screen flex flex-col"
    >
      <header className="relative z-10 flex items-center justify-between p-2 bg-background shadow-sm">
        {/* Le SidebarTrigger est dans AppSidebar ou un autre composant; si tu veux un trigger ici, tu peux l'ajouter */}
        <div className="flex items-center gap-2">
          {/* si tu veux un trigger global, importe SidebarTrigger et place-le */}
        </div>

        <div className="w-48">
          <TranslateWrapper />
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <Footer />
    </div>
  );
}

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      {/* Sidebar garde son markup (gap element + fixed panel) */}
      <Sidebar>
        <AppSidebar />
      </Sidebar>

      {/* MAIN CONTENT (nous lisons l'état via useSidebar) */}
      <MainContent>{children}</MainContent>
    </SidebarProvider>
  );
}
