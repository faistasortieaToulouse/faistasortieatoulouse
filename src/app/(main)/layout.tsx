// faistasortietest2/src/components/MainLayout.tsx

import type { ReactNode } from 'react';
// On supprime l'import de useSidebar et on enlève React.
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar'; 
import { AppSidebar } from '@/components/app-sidebar';
import { Footer } from '@/components/footer';
import { GoogleTranslateWidget } from '@/components/google-translate-widget';
// IMPORT des nouveaux composants CLIENTS
import { CustomSidebarTrigger, SidebarWithContext } from '@/components/sidebar-utils'; 


export default function MainLayout({ children }: { children: ReactNode }) {
  // Ce composant est un Composant Serveur
  return (
    <SidebarProvider>
      {/* SidebarWithContext est un wrapper CLIENT pour AppSidebar */}
      <SidebarWithContext> 
        <Sidebar>
          <AppSidebar />
        </Sidebar>
      </SidebarWithContext>
      
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <header className="relative z-10 flex justify-between p-2 bg-background shadow-sm">
             {/* CustomSidebarTrigger est le Composant CLIENT qui contient useSidebar() */}
             <CustomSidebarTrigger /> 
             
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
