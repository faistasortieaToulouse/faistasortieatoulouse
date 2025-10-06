// faistasortietest2/src/components/app-sidebar.tsx

"use client"; // Le use client est nécessaire pour usePathname si vous l'ajoutez

import React from 'react';
// import { usePathname } from 'next/navigation'; // Décommentez si vous utilisez Next.js App Router pour l'état actif

// --- Importer les dépendances pour la Sidebar ---
import { 
    Calendar, 
    Bus, // Utilisé pour Tisseo/Transport
    LayoutDashboard, 
    Users, 
    Facebook, 
    Map, 
    MessageSquare, 
    LifeBuoy,
    Car,
    Menu, // Ne sert plus, mais on le laisse pour l'instant
    X // Ne sert plus, mais on le laisse pour l'instant
} from 'lucide-react';

// Définition des éléments de navigation
const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
    { href: '/tisseo', icon: Bus, label: 'Tisseo/Transport' }, 
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
    { href: '/calendar', icon: Calendar, label: 'Calendrier' },
    { href: '/mobility', icon: Car, label: 'Mobilité' },
    { href: '/meetup', icon: Users, label: 'Événements Meetup' },
    { href: '/facebook', icon: Facebook, label: 'Groupes Facebook' },
    { href: '/map', icon: Map, label: 'Carte Interactive' },
    { href: '/help', icon: LifeBuoy, label: 'Aide' },
];

// --- Composant AppSidebar EXPORTÉ (NOMMÉ) ---
// Retrait des props isOpen et onToggle qui sont gérées par le contexte SidebarProvider
export function AppSidebar() {
    // const pathname = usePathname(); // Décommentez pour l'état actif
    
    // URL du logo réel de l'application
    const ftsLogo = { imageUrl: "..." }; // URL du logo
    
    // Définition des couleurs pour la palette
    const sidebarBg = '#F7DEEF';
    const textSecondary = 'text-gray-600';
    const borderSecondary = 'border-gray-300';
    const activeBg = 'bg-purple-300';
    const activeText = 'text-gray-900';
    const hoverBg = 'hover:bg-purple-200';
    
    const discordBgStyle = { 
        backgroundColor: '#D02F9D',
        transition: 'background-color 150ms ease-in-out'
    }; 

    return (
        // Le contenu de la Sidebar est désormais rendu directement par <Sidebar>
        <div 
            className="w-full h-full flex flex-col p-4"
            style={{ backgroundColor: sidebarBg }}
        >
            {/* SidebarHeader - Retrait des boutons Fermer/Ouvrir gérés par le Layout */}
            <div className={`p-4 border-b ${borderSecondary} sticky top-0 z-10`} style={{ backgroundColor: sidebarBg }}>
                <div className="flex items-center gap-3">
                    <a href="/" className="flex items-center gap-3 no-underline">
                        {/* ... (Code du logo inchangé) ... */}
                    </a>
                </div>
            </div>
            
            {/* SidebarContent (Menu) */}
            <nav className="flex-1 overflow-y-auto pt-4">
                <div className="flex flex-col gap-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        // Logique d'activation (simulée ici, utilisez usePathname pour le vrai fonctionnement)
                        const isActive = item.href === '/'; // || pathname === item.href; 
                        
                        const linkClasses = `w-full flex items-center p-2 rounded-lg transition ${
                            isActive 
                                ? `${activeBg} ${activeText} font-semibold` 
                                : `${hoverBg} ${textSecondary}`
                        }`;
                        
                        return (
                            <a
                                key={item.label}
                                href={item.href}
                                target={item.external ? "_blank" : "_self"}
                                rel={item.external ? "noopener noreferrer" : undefined}
                                className={linkClasses}
                                // onClick: ne pas fermer, car le SidebarProvider le gère s'il est configuré pour
                            >
                                <Icon className="h-5 w-5 mr-3 text-purple-700" />
                                <span>{item.label}</span>
                            </a>
                        );
                    })}
                </div>
                {/* Liens supplémentaires ou bouton Discord stylisé */}
                <div className="mt-4 pt-4 border-t" style={{ borderColor: borderSecondary }}>
                    <a 
                        href="https://discord.com/invite/votre-invite-ici" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center p-2 rounded-lg text-white font-bold transition hover:brightness-110" 
                        style={discordBgStyle}
                    >
                        <MessageSquare className="h-5 w-5 mr-2" />
                        Rejoindre Discord
                    </a>
                </div>
            </nav>
        </div>
    );
}

// *** ATTENTION : Supprimez l'export default function RootLayout(...) du fichier AppSidebar.tsx ***
