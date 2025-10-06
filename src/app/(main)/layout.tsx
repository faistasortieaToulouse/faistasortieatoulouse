// src/app/(main)/layout.tsx

import MainLayout from '@/components/MainLayout';
// import type { Metadata } from 'next'; // Si vous avez besoin de métadonnées spécifiques à la route /main

// --- Métadonnées optionnelles (si non définies globalement) ---
// export const metadata: Metadata = {
//   title: 'Fais Ta Sortie - Tableau de Bord',
//   description: 'Tableau de bord principal de l\'application FTS.',
// };
// -----------------------------------------------------------

export default function Layout({ children }: { children: React.ReactNode }) {
  // Le rôle de ce fichier est uniquement d'encapsuler les routes enfants
  // dans le layout que vous avez défini dans /components.
  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}
