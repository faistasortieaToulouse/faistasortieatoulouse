"use client";

import React, { useState } from "react";
import { ChevronLeft, Zap, ExternalLink, Mountain, Footprints } from "lucide-react";
import { Facebook, Calendar, Car, LayoutDashboard, Users, MessageSquare } from "lucide-react";
import { Map, LifeBuoy } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";

// Définition du bouton pour replier/déplier la sidebar
const SidebarTrigger = ({
  collapsed,
  onClick,
}: {
  collapsed: boolean;
  onClick: () => void;
}) => (
  <button
    className="lg:hidden cursor-pointer p-1 rounded-full hover:bg-purple-300 transition"
    onClick={onClick}
    aria-label="Toggle Sidebar"
  >
    <ChevronLeft
      className={`w-6 h-6 text-gray-700 transition-transform duration-300 ${
        collapsed ? "rotate-180" : ""
      }`}
    />
  </button>
);

// Liste des liens du menu
const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "https://discord.com/channels/1422806103267344416/1422806103904882842", icon: MessageSquare, label: "Sorties à Toulouse", external: true },
  { href: "https://discord.com/channels/1422806103267344416/1422806103904882842", icon: MessageSquare, label: "Discussions", external: true },
  { href: "/tourisme-offices", icon: Footprints, label: "Organise tes Balades" },
  { href: "/organiser-randos", icon: Mountain, label: "Organise tes Randos" },
  { href: "/organiser-sorties", icon: Zap, label: "Organise tes Sorties" },
  { href: "/discord-events", icon: Calendar, label: "Découvre les sorties" },
  { href: "/calendar", icon: Calendar, label: "Calendrier" },
  { href: "/mobility", icon: Car, label: "Mobilité" },
  { href: "/meetup", icon: Users, label: "Événements Meetup" },
  { href: "/facebook", icon: Facebook, label: "Groupes Facebook" },
  { href: "/map", icon: Map, label: "Carte Interactive" },
  { href: "/partenaires", icon: ExternalLink, label: "Partenaires" },
  { href: "/help", icon: LifeBuoy, label: "Aide" },
];

// Logos
const EXTERNAL_LOGO = "https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2FlogofaistasortieToulouse105.png?alt=media&token=4ed06e88-d01b-403c-8cff-049c5943c0e2";
const LOCAL_LOGO = "/icons/faistasortielogo192OK.png";

export function AppSidebar() {
  const { collapsed, toggle } = useSidebar();
  const [logoSrc, setLogoSrc] = useState(EXTERNAL_LOGO);

  const handleImageError = () => {
    if (logoSrc === EXTERNAL_LOGO) setLogoSrc(LOCAL_LOGO);
  };

  return (
    <aside
      className={`h-full transition-all duration-300 ${
        collapsed
          ? "absolute w-0 overflow-hidden opacity-0 pointer-events-none"
          : "relative w-64 bg-[#F7DEEF] shadow-2xl p-4 pt-10"
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <a href="/" className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex-shrink-0">
            <img
              src={logoSrc}
              alt="FTS Logo"
              onError={handleImageError}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              className="rounded-full"
            />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Fais ta Sortie</h2>
              <p className="text-xs text-gray-600">à Toulouse</p>
            </div>
          )}
        </a>

        <SidebarTrigger collapsed={collapsed} onClick={toggle} />
      </div>

      <nav className="flex-1 flex flex-col gap-2 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label, external }) => (
          <a
            key={label}
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-purple-200"
          >
            <Icon className="w-5 h-5" />
            {!collapsed && label}
          </a>
        ))}

        <a
          href="https://discord.com/channels/1422806103267344416/1422806103904882842"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center p-2 mt-4 rounded-lg text-white font-bold transition hover:brightness-110"
          style={{ backgroundColor: "#D02F9D" }}
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          {!collapsed && "Rejoindre Discord"}
        </a>
      </nav>

      <div className="mt-4 pt-4 border-t border-purple-300" />
    </aside>
  );
}
