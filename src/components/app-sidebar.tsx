// faistasortietest2/src/components/app-sidebar.tsx

"use client"; 

import React from 'react';
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

// Définition des éléments de navigation (inchangée)
const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
    { href: '/tisseo', icon: Bus, label: 'Tisseo/Transport' }, 
    { href: 'https://discord.com/channels/1422806103267344416/1422806103904882842', icon: MessageSquare, label: 'Sorties à Toulouse', external: true },
    { href: 'https://discord.com/channels/1422806103267344416/1422806103904882842', icon: MessageSquare, label: 'Discussions', external: true },
    { href: '/calendar', icon: Calendar, label: 'Calendrier' },
    { href: '/mobility', icon: Car, label: 'Mobilité' },
    { href: '/meetup', icon: Users, label: 'Événements Meetup' },
    { href: '/facebook', icon: Facebook, label: 'Groupes Facebook' },
    { href: '/map', icon: Map, label: 'Carte Interactive' },
    { href: '/help', icon: LifeBuoy, label: 'Aide' },
];

export function AppSidebar({ onToggle, isOpen }: { onToggle: () => void, isOpen: boolean }) {
    
    // URL du logo réel de l'application
    const ftsLogo = { imageUrl: "https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2FlogofaistasortieToulouse105.png?alt=media&token=4ed06e88-d01b-403c-8cff-049c5943c0e2" }; 
    
    // Définition des couleurs pour la palette
    const sidebarBg = '#F7DEEF';
    const textPrimary = 'text-gray-900'; 
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
        // Le contenu de la Sidebar doit être dans un seul conteneur DIV, 
        // sans le fragment <> et sans la balise <aside>.
        <div 
            className="w-full h-full flex flex-col p-4" 
            style={{ backgroundColor: sidebarBg }}
        >
            {/* 1. SidebarHeader (Logo et Titre) */}
            <div className={`p-4 border-b ${borderSecondary} sticky top-0 z-10`} style={{ backgroundColor: sidebarBg }}>
                <div className="flex items-center justify-between gap-3">
                    {/* Logo et Titre */}
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
                            <h2 className={`text-lg font-semibold ${textPrimary}`}>Fais ta Sortie</h2>
                            <p className={`text-xs ${textSecondary}`}>à Toulouse</p>
                        </div>
                    </a>
                    
                    {/* Le bouton de fermeture (X) est toujours supprimé ici */}
                    
                </div>
            </div>
            
            {/* 2. SidebarContent (Menu de Navigation) */}
            <nav className="flex-1 overflow-y-auto pt-4">
                <div className="flex flex-col gap-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.href === '/'; 
                        
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
                                // onToggle est appelé ici pour fermer le menu après le clic (sur mobile)
                                onClick={onToggle} 
                            >
                                <Icon className="h-5 w-5 mr-3 text-purple-700" />
                                <span>{item.label}</span>
                            </a>
                        );
                    })}
                </div>
                {/* Bouton Discord */}
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
