// src/components/sidebar-utils.tsx
"use client";

import React from 'react';
import { useSidebar } from '@/components/ui/sidebar'; // Hook Client
import { ChevronLeft } from 'lucide-react';

// 1. Composant Bouton Personnalisé (CustomSidebarTrigger)
// Il utilise le hook useSidebar pour ouvrir/fermer la sidebar.
export const CustomSidebarTrigger = () => {
  // Le hook useSidebar() est appelé ici, DANS le Composant Client.
  const { toggleSidebar } = useSidebar(); 

  return (
    <button 
      onClick={toggleSidebar} 
      className="p-2 rounded-lg text-gray-900 hover:bg-gray-100 transition focus:outline-none"
      aria-label="Toggle Sidebar"
    >
      <ChevronLeft className="h-6 w-6" /> 
    </button>
  );
};

// 2. Composant Wrapper pour le Contexte (SidebarWithContext)
// Il utilise le hook useSidebar() pour récupérer l'état et le passer à AppSidebar.
export function SidebarWithContext({ children }: { children: React.ReactElement }) {
    // Le hook useSidebar() est appelé ici, DANS le Composant Client.
    const { isOpen, toggleSidebar } = useSidebar(); 
    return (
        // On clone l'élément enfant (AppSidebar) pour lui injecter les props onToggle et isOpen
        <>{React.cloneElement(children, { isOpen, onToggle: toggleSidebar })}</>
    );
}
