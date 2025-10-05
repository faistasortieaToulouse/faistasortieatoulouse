import React from 'react';

// --- Importer les dépendances pour la Sidebar ---
import { 
    Calendar, 
    Bus, 
    LayoutDashboard, 
    Users, 
    Facebook, 
    Map, 
    MessageSquare, 
    LifeBuoy,
    // Icône Car pour Mobilité
    Car,
    Menu // Ajout de l'icône Menu
} from 'lucide-react';

// Définition des éléments de navigation
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
export function AppSidebar() { // Exportation nommée pour l'importation dans MainLayout.tsx
    // URL du logo réel de l'application (CORRIGÉ avec le jeton fourni par l'utilisateur)
    const ftsLogo = { imageUrl: "https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2FlogofaistasortieToulouse105.png?alt=media&token=4ed06e88-d01b-403c-8cff-049c5943c0e2" }; 

    // Définition des couleurs pour la nouvelle palette (F7DEEF est très clair)
    const sidebarBg = '#F7DEEF';
    // Pour assurer un contraste suffisant, nous passons le texte au noir
    const textPrimary = 'text-gray-900'; 
    const textSecondary = 'text-gray-600';
    const borderSecondary = 'border-gray-300';
    // L'accent (actif, hover) pourrait être maintenu en indigo ou changé pour un magenta/violet assorti.
    const activeBg = 'bg-purple-300';
    const activeText = 'text-gray-900';
    const hoverBg = 'hover:bg-purple-200';
    
    // --- Nouvelle Couleur Discord ---
    // Nous définissons la couleur de base directement sur le bouton
    const discordBgStyle = { 
        backgroundColor: '#D02F9D', // Magenta
        transition: 'background-color 150ms ease-in-out' // Ajout de la transition CSS
    }; 
    
    return (
        <aside 
            className="w-64 h-screen p-4 flex flex-col shadow-2xl sticky top-0"
            style={{ backgroundColor: sidebarBg }} // Nouvelle couleur de fond appliquée ici
        >
            {/* SidebarHeader */}
            <div className={`p-4 border-b ${borderSecondary}`}>
                {/* Utilisation de justify-between pour positionner le logo et le bouton du menu */}
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
                    
                    {/* Bouton Menu Burger */}
                    <button 
                        className={`p-2 rounded-lg ${textPrimary} hover:bg-purple-300 transition focus:outline-none`}
                        // Vous devrez ajouter la logique de gestion d'état ici pour ouvrir/fermer le menu
                        aria-label="Toggle menu"
                    >
                        <Menu className="h-6 w-6" />
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

                    // Définir si le lien est actif (simplifié)
                    const isActive = item.href === '/'; // Seul le tableau de bord est actif pour cette démo

                    const linkClasses = `w-full flex items-center p-3 rounded-lg transition duration-150 ${
                        isActive 
                            ? `${activeBg} ${activeText} shadow-lg` // Nouvelle couleur active
                            : `${textPrimary} ${hoverBg} hover:text-gray-900` // Nouvelle couleur de survol et texte
                    }`;

                    return (
                        <div key={item.label} className="mb-1">
                            {item.external ? (
                                <a 
                                    href={item.href} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className={linkClasses}
                                >
                                    {ButtonContent}
                                </a>
                            ) : (
                                <a // Remplacé par <a> pour la compatibilité dans le Layout
                                    href={item.href}
                                    className={linkClasses}
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
                    // Suppression des gestionnaires d'événements React pour la compatibilité SSR
                    className="w-full flex items-center justify-center p-2 rounded-lg text-white transition hover:brightness-110" 
                    style={discordBgStyle} 
                >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Rejoindre Discord
                </a>
            </div>
        </aside>
    );
}
// --- Fin du Composant AppSidebar intégré ---


// --- Composant RootLayout EXPORTÉ (PAR DÉFAUT) ---
// Ceci permet à ce fichier d'être visualisé dans la démo et fournit un export par défaut.
export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="font-sans antialiased">
            <div className="flex min-h-screen">
                {/* 1. La Barre Latérale */}
                <AppSidebar /> 
                
                {/* 2. Le Contenu de la Page (children) est à côté */}
                <main className="flex-1 overflow-y-auto">
                    {/* Ajout d'un contenu de démo pour remplir le Layout */}
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
