// src/app/(main)/layout.tsx

import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/app-sidebar'; // ✅ CORRIGÉ : Importation par défaut
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
                    <header className="relative z-10 flex justify-end p-2 bg-background">
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
