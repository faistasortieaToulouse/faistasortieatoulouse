import React from 'react';

// --- Importer les dépendances pour la Sidebar ---
// NOTE: Nous ne pouvons pas utiliser 'next/link' ou 'next/navigation' dans l'environnement de compilation
// car ils ne sont pas disponibles ici. J'utilise donc des balises <a> simples pour les liens externes
// et laisse les liens internes en tant que balises div pour la compilation, mais vous devrez
// remettre les imports 'next/link' et 'usePathname' après la compilation.

import { 
    Calendar, 
    Bus, 
    LayoutDashboard, 
    Users, 
    Facebook, 
    Map, 
    MessageSquare, 
    LifeBuoy,
    Car 
} from 'lucide-react';

// Définition des éléments de navigation (avec un chemin simple sans useRouter)
const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
    {
        href: 'https://discord.com/channels/1422806103267344416/1422806103904882842',
        icon: MessageSquare,
        label: 'Sorties à Toulouse',
        external: true,
    },
    {
        href: 'https://discord.com/channels/1422806103267344416/1422806103904882842',
        icon: MessageSquare,
        label: 'Discussions',
        external: true,
    },
    
    { href: '/meetup', icon: Users, label: 'Événements Meetup' },
    { href: '/facebook', icon: Facebook, label: 'Groupes Facebook' },
    { href: '/map', icon: Map, label: 'Carte Interactive' },

    { href: '/calendar', icon: Calendar, label: 'Calendrier' },
    { href: '/mobility', icon: Car, label: 'Mobilité' },
    { href: '/help', icon: LifeBuoy, label: 'Aide' },
];

// --- Composant AppSidebar : Ajout de l'EXPORT DEFAULT ---
export default function AppSidebar() { // <--- CORRECTION MAJEURE
    // NOTE: Dans un layout de serveur (RootLayout), nous ne pouvons pas utiliser usePathname().
    const ftsLogo = { imageUrl: "https://placehold.co/40x40/9333ea/ffffff?text=FTS" }; 

    return (
        <aside className="w-64 bg-gray-900 h-screen p-4 flex flex-col shadow-2xl sticky top-0">
            {/* SidebarHeader */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <a href="/" className="flex items-center gap-3 no-underline">
                        {ftsLogo && (
                            <img
                                src={ftsLogo.imageUrl}
                                alt="FTS Logo"
                                width={40}
                                height={40}
                                className="rounded-full"
                            />
                        )}
                        <div className="flex flex-col">
                            <h2 className="text-lg font-semibold text-white">Fais ta Sortie</h2>
                            <p className="text-xs text-gray-400">à Toulouse</p>
                        </div>
                    </a>
                </div>
            </div>
            
            {/* SidebarContent (Menu) */}
            <nav className="flex-1 overflow-y-auto pt-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    // Simuler le bouton de menu
                    const ButtonContent = (
                        <>
                            <Icon className="h-5 w-5 mr-3" />
                            <span>{item.label}</span>
                        </>
                    );

                    return (
                        <div key={item.label} className="mb-1">
                            {item.external ? (
                                <a 
                                    href={item.href} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="w-full flex items-center p-3 rounded-lg transition duration-150 text-gray-300 hover:bg-gray-700 hover:text-white"
                                >
                                    {ButtonContent}
                                </a>
                            ) : (
                                <a 
                                    href={item.href}
                                    className="w-full flex items-center p-3 rounded-lg transition duration-150 text-gray-300 hover:bg-gray-700 hover:text-white"
                                >
                                    {ButtonContent}
                                </a>
                            )}
                        </div>
                    );
                })}
            </nav>
            
            {/* SidebarFooter */}
            <div className="p-4 border-t border-gray-700 mt-auto">
                <a
                    href="https://discord.com/channels/1422806103267344416/1422806103904882842"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center p-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition"
                >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Rejoindre Discord
                </a>
            </div>
        </aside>
    );
}

// *** IMPORTANT : SUPPRIMEZ TOUT LE CODE DU RootLayout QUI SUIVAIT ICI ***
// Le RootLayout doit être dans son propre fichier (par exemple, src/app/layout.tsx ou src/app/(main)/layout.tsx)
