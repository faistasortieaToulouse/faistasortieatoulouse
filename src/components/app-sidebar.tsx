"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Bus, LayoutDashboard, Users, MessageSquare, Car } from "lucide-react";
import { Facebook, Map, LifeBuoy } from "lucide-react"; // si ces icônes existent
import { SidebarTrigger } from "@/components/ui/sidebar"; // Remplacé SidebarClose par SidebarTrigger

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/tisseo", icon: Bus, label: "Tisseo/Transport" },
  { href: "https://discord.com/channels/1422806103267344416/1422806103904882842", icon: MessageSquare, label: "Sorties à Toulouse", external: true },
  { href: "/discussions", icon: MessageSquare, label: "Discussions" },
  { href: "/calendar", icon: Calendar, label: "Calendrier" },
  { href: "/mobility", icon: Car, label: "Mobilité" },
  { href: "/meetup", icon: Users, label: "Événements Meetup" },
  { href: "/facebook-groups", icon: Facebook, label: "Groupes Facebook" },
  { href: "/map", icon: Map, label: "Carte Interactive" },
  { href: "/help", icon: LifeBuoy, label: "Aide" },
];


export function AppSidebar() {
  const ftsLogo = "https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2FlogofaistasortieToulouse105.png?alt=media";

  return (
    <aside className="w-64 h-full bg-[#F7DEEF] flex flex-col p-4 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
<a href="/" className="flex items-center gap-3">
  <Image
    src={ftsLogo}
    alt="FTS Logo"
    width={40}        // largeur du logo en pixels
    height={40}       // hauteur du logo en pixels
    className="rounded-full"
  />
  <div>
    <h2 className="text-lg font-semibold text-gray-900">Fais ta Sortie</h2>
    <p className="text-xs text-gray-600">à Toulouse</p>
  </div>
</a>
        <SidebarTrigger className="lg:hidden cursor-pointer" />
      </div>

      <nav className="flex-1 flex flex-col gap-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const linkProps = item.external ? { href: item.href, target: "_blank", rel: "noopener noreferrer" } : { href: item.href };
          return (
            <Link key={item.label} {...linkProps} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-purple-200">
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}

        <a
          href="https://discord.gg/yourinvite"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center p-2 mt-4 rounded-lg text-white font-bold transition hover:brightness-110"
          style={{ backgroundColor: "#D02F9D" }}
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          Rejoindre Discord
        </a>
      </nav>
    </aside>
  );
}
