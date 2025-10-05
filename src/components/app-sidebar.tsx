import React, { useState, useEffect } from 'react';

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
    Menu,
    X // Icône pour fermer le menu sur mobile
} from 'lucide-react';

// Définition des éléments de navigation
const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
    // Ajout du nouvel élément de menu "Tisseo/Transport"
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
    // Liens Calendrier et Mobilité
    { href: '/calendar', icon: Calendar, label: 'Calendrier' },
    { href: '/mobility', icon: Car, label: 'Mobilité' },

    { href: '/meetup', icon: Users, label: 'Événements Meetup' },
    { href: '/facebook', icon: Facebook, label: 'Groupes Facebook' },
    { href: '/map', icon: Map, label: 'Carte Interactive' },

    { href: '/help', icon: LifeBuoy, label: 'Aide' },
];

// --- Composant AppSidebar EXPORTÉ (NOMMÉ) ---
/**
 * Composant de la barre latérale de navigation de l'application.
 * Il est utilisé par le MainLayout.
 */
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
    
    // --- Nouvelle Couleur Discord ---
    const discordBgStyle = { 
        backgroundColor: '#D02F9D',
        transition: 'background-color 150ms ease-in-out'
    }; 

    // Classes conditionnelles pour l'ouverture/fermeture sur mobile
    const mobileClasses = `fixed top-0 left-0 z-40 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0 lg:sticky`; // Toujours visible sur grand écran

    return (
        <>
            {/* Overlay Mobile (visible uniquement lorsque le menu est ouvert sur petit écran) */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-gray-900 bg-opacity-50 z-30 lg:hidden"
                    onClick={onToggle}
                    aria-hidden="true"
                />
            )}

            {/* Barre Latérale */}
            <aside 
                className={`w-64 h-screen p-4 flex flex-col shadow-2xl ${mobileClasses}`}
                style={{ backgroundColor: sidebarBg }}
            >
                {/* SidebarHeader */}
                <div className={`p-4 border-b ${borderSecondary} sticky top-0 bg-[${sidebarBg}] z-10`} style={{ backgroundColor: sidebarBg }}>
                    <div className="flex items-center justify-between gap-3">
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
                        
                        {/* Bouton Fermer (visible uniquement sur les petits écrans) */}
                        <button 
                            className={`p-2 rounded-lg ${textPrimary} hover:bg-purple-300 transition focus:outline-none lg:hidden`}
                            onClick={onToggle}
                            aria-label="Fermer le menu"
                        >
                            <X className="h-6 w-6" />
                        </button>
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

                        // Définir si le lien est actif (simplifié pour la démo)
                        const isActive = item.href === '/'; 

                        const linkClasses = `w-full flex items-center p-3 rounded-lg transition duration-150 ${
                            isActive 
                                ? `${activeBg} ${activeText} shadow-lg` 
                                : `${textPrimary} ${hoverBg} hover:text-gray-900`
                        }`;

                        return (
                            <div key={item.label} className="mb-1">
                                {item.external ? (
                                    <a 
                                        href={item.href} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className={linkClasses}
                                        onClick={onToggle} // Fermer le menu après un clic (sur mobile)
                                    >
                                        {ButtonContent}
                                    </a>
                                ) : (
                                    <a 
                                        href={item.href}
                                        className={linkClasses}
                                        onClick={onToggle} // Fermer le menu après un clic (sur mobile)
                                    >
                                        {ButtonContent}
                                    </a>
                                )}
                            </div>
                        );
                    })}
                </nav>
                
                {/* SidebarFooter */}
                <div className={`p-4 border-t ${borderSecondary} mt-auto`}>
                    <a
                        href="https://discord.com/channels/1422806103267344416/1422806103904882842"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center p-2 rounded-lg text-white transition hover:brightness-110" 
                        style={discordBgStyle}
                        onClick={onToggle} // Fermer le menu après un clic (sur mobile)
                    >
                        <MessageSquare className="h-5 w-5 mr-2" />
                        Rejoindre Discord
                    </a>
                </div>
            </aside>
        </>
    );
}

// --- Composant RootLayout EXPORTÉ (PAR DÉFAUT) ---
// Ceci enveloppe le layout et gère l'état du menu burger sur mobile
export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // État pour la barre latérale mobile
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Fonction pour basculer l'état
    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    // Fermer la sidebar si la taille de l'écran passe de mobile à desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024 && isSidebarOpen) {
                setIsSidebarOpen(false); // Ferme l'état mobile quand on passe en desktop (lg:1024px)
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isSidebarOpen]);

    return (
        <div className="font-sans antialiased">
            <div className="flex min-h-screen">
                {/* 1. La Barre Latérale (Mobile et Desktop) */}
                <AppSidebar 
                    isOpen={isSidebarOpen} 
                    onToggle={toggleSidebar} 
                />
                
                {/* 2. Le Contenu de la Page (children) est à côté */}
                <main className="flex-1 overflow-y-auto lg:ml-64"> 
                    {/* Bouton Menu Burger (visible uniquement sur les petits écrans) */}
                    <div className="p-4 lg:hidden sticky top-0 bg-white shadow-md z-20">
                        <button 
                            className="p-2 rounded-lg text-gray-900 hover:bg-gray-100 transition focus:outline-none"
                            onClick={toggleSidebar}
                            aria-label="Ouvrir le menu"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Contenu principal */}
                    <div className="p-8">
                        <h1 className="text-4xl font-bold text-gray-800">Contenu Principal</h1>
                        <p className="mt-4 text-gray-600">Le contenu de vos pages s'affichera ici.</p>
                    </div>
                    {children} 
                </main>
            </div>
        </div>
    );
}
