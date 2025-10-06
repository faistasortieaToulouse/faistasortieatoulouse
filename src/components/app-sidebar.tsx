"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Bus,
  LayoutDashboard,
  Users,
  Facebook,
  Map,
  MessageSquare,
  LifeBuoy,
  Car,
  Menu,
  X,
} from "lucide-react";

// Éléments de navigation
const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/tisseo", icon: Bus, label: "Tisseo/Transport" },
  {
    href: "https://discord.com/channels/1422806103267344416/1422806103904882842",
    icon: MessageSquare,
    label: "Sorties à Toulouse",
    external: true,
  },
  {
    href: "https://discord.com/channels/1422806103267344416/1422806103904882842",
    icon: MessageSquare,
    label: "Discussions",
    external: true,
  },
  { href: "/calendar", icon: Calendar, label: "Calendrier" },
  { href: "/mobility", icon: Car, label: "Mobilité" },
  { href: "/meetup", icon: Users, label: "Événements Meetup" },
  { href: "/facebook", icon: Facebook, label: "Groupes Facebook" },
  { href: "/map", icon: Map, label: "Carte Interactive" },
  { href: "/help", icon: LifeBuoy, label: "Aide" },
];

// --- Barre latérale ---
export function AppSidebar({
  onToggle,
  isOpen,
}: {
  onToggle: () => void;
  isOpen: boolean;
}) {
  const ftsLogo = {
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2FlogofaistasortieToulouse105.png?alt=media&token=4ed06e88-d01b-403c-8cff-049c5943c0e2",
  };

  const sidebarBg = "#F7DEEF";
  const textPrimary = "text-gray-900";
  const textSecondary = "text-gray-600";
  const borderSecondary = "border-gray-300";
  const hoverBg = "hover:bg-purple-200";
  const discordBgStyle = {
    backgroundColor: "#D02F9D",
    transition: "background-color 150ms ease-in-out",
  };

  const mobileClasses = `fixed top-0 left-0 z-40 transform transition-transform duration-300 ${
    isOpen ? "translate-x-0" : "-translate-x-full"
  } lg:translate-x-0 lg:sticky`;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-30 lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      <aside
        className={`w-64 h-screen p-4 flex flex-col shadow-2xl ${mobileClasses}`}
        style={{ backgroundColor: sidebarBg }}
      >
        {/* Header */}
        <div
          className={`p-4 border-b ${borderSecondary} sticky top-0 z-10`}
          style={{ backgroundColor: sidebarBg }}
        >
          <div className="flex items-center justify-between gap-3">
            <a href="/" className="flex items-center gap-3 no-underline">
              <img
                src={ftsLogo.imageUrl}
                alt="FTS Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="flex flex-col">
                <h2 className={`text-lg font-semibold ${textPrimary}`}>
                  Fais ta Sortie
                </h2>
                <p className={`text-xs ${textSecondary}`}>à Toulouse</p>
              </div>
            </a>

            <button
              className={`p-2 rounded-lg ${textPrimary} hover:bg-purple-300 transition focus:outline-none lg:hidden`}
              onClick={onToggle}
              aria-label="Fermer le menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto pt-4">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const linkProps = item.external
                ? { href: item.href, target: "_blank", rel: "noopener noreferrer" }
                : { href: item.href };

              return (
                <Link
                  key={item.label}
                  {...linkProps}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${textPrimary} ${hoverBg}`}
                  onClick={onToggle}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}

            {/* Bouton Discord spécial */}
            <a
              href="https://discord.gg/yourinvite"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center p-2 rounded-lg text-white font-bold transition hover:brightness-110"
              style={discordBgStyle}
              onClick={onToggle}
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Rejoindre Discord
            </a>
          </div>
        </nav>
      </aside>
    </>
  );
}

// --- Layout principal avec sidebar ---
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarOpen]);

  return (
    <div className="font-sans antialiased">
      <div className="flex min-h-screen">
        <AppSidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

        <main className="flex-1 overflow-y-auto lg:ml-64">
          {/* Bouton menu mobile */}
          <div className="p-4 lg:hidden sticky top-0 bg-white shadow-md z-20">
            <button
              className="p-2 rounded-lg text-gray-900 hover:bg-gray-100 transition focus:outline-none"
              onClick={toggleSidebar}
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-800">
              Contenu Principal
            </h1>
            <p className="mt-4 text-gray-600">
              Le contenu de vos pages s'affichera ici.
            </p>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
