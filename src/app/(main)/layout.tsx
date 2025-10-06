// faistasortietest2/src/components/MainLayout.tsx

import type { ReactNode } from 'react';
// ATTENTION : Assurez-vous d'importer useSidebar dans cette ligne si vous voulez utiliser le contexte.
import { SidebarProvider, Sidebar, SidebarInset, useSidebar } from '@/components/ui/sidebar'; 
import { AppSidebar } from '@/components/app-sidebar';
import { Footer } from '@/components/footer';
import { GoogleTranslateWidget } from '@/components/google-translate-widget';
import { ChevronLeft } from 'lucide-react'; // <-- Import de la nouvelle icône

// Composant utilitaire pour le bouton
// On peut le définir en dehors de la fonction MainLayout
const CustomSidebarTrigger = () => {
  // Hook pour accéder à l'état et la fonction de bascule de la sidebar
  const { toggleSidebar } = useSidebar(); 

  return (
    <button 
      onClick={toggleSidebar} 
      className="p-2 rounded-lg text-gray-900 hover:bg-gray-100 transition focus:outline-none"
      aria-label="Toggle Sidebar"
    >
      {/* Utilisation de l'icône < qui indique la direction de la fermeture/ouverture */}
      <ChevronLeft className="h-6 w-6" /> 
    </button>
  );
};

// Fonction utilitaire pour extraire l'état du contexte et le passer à AppSidebar
// (Celle que nous avions introduite précédemment)
function SidebarWithContext({ children }: { children: React.ReactElement }) {
    const { isOpen, toggleSidebar } = useSidebar(); 
    return (
        <Sidebar>
            {React.cloneElement(children, { isOpen, onToggle: toggleSidebar })}
        </Sidebar>
    );
}


export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <SidebarWithContext> {/* Utilisez le wrapper pour passer les props à AppSidebar */}
        <AppSidebar />
      </SidebarWithContext>
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          {/* HEADER : Remplacement du SidebarTrigger par le CustomSidebarTrigger */}
          <header className="relative z-10 flex justify-between p-2 bg-background shadow-sm">
             {/* 1. Bouton < (visible sur tous les écrans) */}
             <CustomSidebarTrigger /> 
             
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
