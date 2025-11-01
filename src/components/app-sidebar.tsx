"use client";

import React, { useState } from "react";
// Remplacement de 'next/link' et 'next/image' par des éléments HTML natifs
// pour éviter les erreurs de dépendance dans cet environnement.
import { ChevronLeft, Zap, ExternalLink, Mountain, Footprints } from 'lucide-react';
import { Facebook, Calendar, Bus, LayoutDashboard, Users, MessageSquare, Car } from "lucide-react";
import { Map, LifeBuoy } from "lucide-react";
// Les imports suivants sont commentés car ils ne sont pas définis dans cet environnement
// import { SidebarTrigger } from "@/components/ui/sidebar";
// import GoogleTranslate from '@/components/GoogleTranslate';

// Composant de substitution pour SidebarTrigger (simplement un bouton)
const SidebarTrigger = ({ className }: { className: string }) => (
  <button className={className} aria-label="Toggle Sidebar">
    <ChevronLeft className="w-6 h-6 text-gray-700" />
  </button>
);


const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "https://discord.com/channels/1422806103267344416/1422806103904882842", icon: MessageSquare, label: "Sorties à Toulouse", external: true },
  { href: "https://discord.com/channels/1422806103267344416/1422806103904882842", icon: MessageSquare, label: "Discussions", external: true },
  { href: "/tourisme-offices", icon: Footprints, label: "Organise tes Balades" },
  { href: "/organiser-randos", icon: Mountain, label: "Organise tes Randos" },
  { href: "/organiser-sorties", icon: Zap, label: "Organise tes Sorties" },
  { href: "/calendar", icon: Calendar, label: "Calendrier" },
  { href: "/discord-events", icon: Calendar, label: "Découvre les évènements" },
  { href: "/mobility", icon: Car, label: "Mobilité" },
  { href: "/meetup", icon: Users, label: "Événements Meetup" },
  { href: "/facebook", icon: Facebook, label: "Groupes Facebook" },
  { href: "/map", icon: Map, label: "Carte Interactive" },
  { href: "/partenaires", icon: ExternalLink, label: "Partenaires" },
  { href: "/help", icon: LifeBuoy, label: "Aide" },
];

// Define logo sources
// L'URL Firebase est celle qui fonctionne sur téléphone
const EXTERNAL_LOGO = "https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2FlogofaistasortieToulouse105.png?alt=media&token=4ed06e88-d01b-403c-8cff-049c5943c0e2";
// Le chemin local est celui qui fonctionne sur ordinateur
const LOCAL_LOGO = "/icons/faistasortielogo192OK.png"; 

export function AppSidebar() {
  // Démarre avec l'URL externe (préférée pour les mobiles et pour tester)
  const [logoSrc, setLogoSrc] = useState(EXTERNAL_LOGO);

  // Fonction appelée si le chargement de l'image échoue
  const handleImageError = () => {
    // Si l'image de Firebase ne se charge pas, basculer vers le chemin local
    if (logoSrc === EXTERNAL_LOGO) {
      setLogoSrc(LOCAL_LOGO);
    }
  };

  return (
    <aside className="w-64 h-full bg-[#F7DEEF] flex flex-col p-4 pt-10 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        {/* Remplacement de Link par <a> */}
        <a href="/" className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex-shrink-0">
            {/* Remplacement de Image par <img> */}
            <img
              src={logoSrc}
              alt="FTS Logo"
              // Ajout de onError pour gérer le basculement d'image
              onError={handleImageError}
              // Styles pour simuler fill et object-cover
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              className="rounded-full"
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Fais ta Sortie</h2>
            <p className="text-xs text-gray-600">à Toulouse</p>
          </div>
        </a>

        {/* Utilisation du composant de substitution SidebarTrigger */}
        <SidebarTrigger className="lg:hidden cursor-pointer p-1 rounded-full hover:bg-purple-300 transition" />
      </div>

      <nav className="flex-1 flex flex-col gap-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          // Si lien externe, utiliser <a>
          if (item.external) {
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-purple-200"
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </a>
            );
          }

          return (
            // Remplacement de Link par <a>
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-purple-200"
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </a>
          );
        })}

        {/* Lien Discord spécifique */}
        <a
          href="https://discord.com/channels/1422806103267344416/1422806103904882842"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center p-2 mt-4 rounded-lg text-white font-bold transition hover:brightness-110"
          style={{ backgroundColor: "#D02F9D" }}
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          Rejoindre Discord
        </a>
      </nav>
      
      {/* Simulation de GoogleTranslate ici pour le rendre autonome */}
      <div className="mt-4 pt-4 border-t border-purple-300">
        <p className="text-sm text-gray-600 italic">Traduction (simulée)</p>
      </div>
    </aside>
  );
}
