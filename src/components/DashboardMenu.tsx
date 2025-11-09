import React, { useState } from 'react';
import { Download, PartyPopper, Menu, X } from 'lucide-react';

// Composant Simulé de la Barre Latérale (Ceci représente le contenu de src/components/app-sidebar.tsx)
const AppSidebar = ({ isOpen, onClose }) => {
  const sidebarClasses = `
    fixed inset-y-0 left-0 w-64 bg-white shadow-2xl z-40 p-6 
    transform transition-transform duration-300 ease-in-out
    md:relative md:translate-x-0 md:shadow-none md:bg-gray-100 
    h-full md:h-auto
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  // Les rubriques simulées de app-sidebar.tsx
  const menuItems = [
    { name: 'Accueil', href: '#' },
    { name: 'Communauté', href: '#' },
    { name: 'Événements', href: '#' },
    { name: 'Partenariats', href: '#' },
    { name: 'Aide & Support', href: '#' },
  ];

  return (
    <>
      {/* Overlay pour le mobile (cliquer dessus ferme la sidebar) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={onClose}
        />
      )}
      
      <div id="app-sidebar" className={sidebarClasses}>
        {/* En-tête de la Sidebar avec bouton de fermeture sur mobile */}
        <div className="flex justify-between items-center mb-6 border-b pb-3 md:hidden">
            <h2 className="text-xl font-bold text-indigo-700">Navigation</h2>
            <button 
                onClick={onClose} 
                className="p-2 rounded-full hover:bg-indigo-200 transition"
                aria-label="Fermer le menu"
            >
                <X className="h-6 w-6 text-indigo-700" />
            </button>
        </div>
        
        {/* Liste des rubriques */}
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                className="block p-3 text-gray-700 font-semibold rounded-lg hover:bg-indigo-200 hover:text-indigo-700 transition duration-150 ease-in-out"
                onClick={onClose} // Ferme le menu après un clic sur mobile
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

// Composant DashboardMenu (basé sur votre structure fournie)
// Note: Les props ftsLogoUrl et StaticImageData ne sont pas utilisées/disponibles dans cet environnement.
const DashboardMenu = ({ isSidebarOpen, onToggleSidebar }) => {
  
  // Composant helper pour simuler les composants Link et Button externes
  const ButtonLink = ({ children, href, variant = 'primary', className = '' }) => (
    <a href={href} target="_blank" className={`
      w-full md:w-auto text-center px-6 py-3 rounded-xl font-semibold transition shadow-md flex items-center justify-center text-lg
      ${variant === 'primary' 
        ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
        : variant === 'outline' 
        ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
        : variant === 'secondary'
        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' // Correspond à votre variant="secondary"
        : ''
      }
      ${className}
    `}>
      {children}
    </a>
  );

  const ButtonDisabled = ({ children }) => (
    <button disabled className="w-full md:w-auto text-center px-6 py-3 rounded-xl font-semibold transition shadow-md bg-white text-gray-400 border border-gray-200 cursor-not-allowed flex items-center justify-center text-lg">
        {children}
    </button>
  );

  return (
    <div className="relative w-full">
      {/* BOUTONS TOUJOURS VISIBLES (mobile + desktop) */}
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        
        {/* 1. Bouton principal */}
        <ButtonLink href="https://discord.com/channels/1422806103267344416/1422806103904882842" variant="primary">
          Pour commencer clique sur ce bouton
        </ButtonLink>

        {/* 2. Bouton secondaire (Télécharger Discord) */}
        <ButtonLink href="https://discord.com/download" variant="outline">
          <Download className="mr-2 h-5 w-5 inline-block" />
          Télécharger Discord
        </ButtonLink>

        {/* 3. Bouton de TOGGLE du menu (Visible sur mobile, masqué sur desktop) */}
        <button
          onClick={onToggleSidebar}
          className="w-full md:w-auto px-6 py-3 rounded-xl font-semibold transition shadow-md flex items-center justify-center text-lg
            bg-gray-200 text-gray-800 hover:bg-gray-300 md:hidden" 
          aria-expanded={isSidebarOpen}
          aria-controls="app-sidebar"
        >
          {isSidebarOpen ? (
            <>
              <X className="mr-2 h-5 w-5" />
              Masquer le menu
            </>
          ) : (
            <>
              <Menu className="mr-2 h-5 w-5" />
              Afficher le menu
            </>
          )}
        </button>

        {/* Note: Sur desktop, le bouton de toggle est masqué car la sidebar est toujours visible. */}
        {/* Si vous voulez que ce bouton soit visible même sur desktop, retirez la classe md:hidden ci-dessus. */}
      </div>

      {/* ÉVÉNEMENTS DÉSACTIVÉS */}
      <div className="flex flex-col md:flex-row gap-2 mt-4">
        <ButtonDisabled>
          <PartyPopper className="mr-2 h-5 w-5 inline-block" />
          Girls Party
        </ButtonDisabled>
        <ButtonDisabled>
          <PartyPopper className="mr-2 h-5 w-5 inline-block" />
          Student Event
        </ButtonDisabled>
        <ButtonDisabled>
          <PartyPopper className="mr-2 h-5 w-5 inline-block" />
          Rando Trip
        </ButtonDisabled>
      </div>
    </div>
  );
};

// Composant principal (App) qui simule la page entière et gère l'état
const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 font-sans">
      
      {/* Sidebar - Fixe sur mobile (hidden/shown), relative sur desktop (toujours visible) */}
      <AppSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Contenu principal / Menu du tableau de bord */}
      <main className="flex-1 p-4 md:p-8">
        <DashboardMenu 
          isSidebarOpen={isSidebarOpen} 
          onToggleSidebar={toggleSidebar} 
        />
        
        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Contenu Principal</h2>
            <p className="text-gray-600">
                Ceci est l'espace où le contenu principal de votre tableau de bord s'affichera. 
                Redimensionnez l'écran ou ouvrez la prévisualisation sur mobile pour voir le bouton de menu fonctionner.
            </p>
        </div>
      </main>

    </div>
  );
};

export default App;
