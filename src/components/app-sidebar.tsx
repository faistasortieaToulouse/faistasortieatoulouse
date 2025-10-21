"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { LayoutDashboard, MessageSquare, Footprints, Mountain, Zap, Calendar, Car, Users, Facebook, ExternalLink, Map, LifeBuoy } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar"; // Client-side

const GoogleTranslate = dynamic(() => import('@/components/GoogleTranslate'), { ssr: false });

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "https://discord.com/channels/1422806103267344416/1422806103904882842", icon: MessageSquare, label: "Sorties à Toulouse", external: true },
  { href: "https://discord.com/channels/1422806103267344416/1422806103904882842", icon: MessageSquare, label: "Discussions", external: true },
  { href: "/tourisme-offices", icon: Footprints, label: "Organise tes Balades" },
  { href: "/organiser-randos", icon: Mountain, label: "Organise tes Randos" },
  { href: "/organiser-sorties", icon: Zap, label: "Organise tes Sorties" },
  { href: "/calendar", icon: Calendar, label: "Calendrier" },
  { href: "/mobility", icon: Car, label: "Mobilité" },
  { href: "/meetup", icon: Users, label: "Événements Meetup" },
  { href: "/facebook", icon: Facebook, label: "Groupes Facebook" },
  { href: "/map", icon: Map, label: "Carte Interactive" },
  { href: "/partenaires", icon: ExternalLink, label: "Partenaires" },
  { href: "/help", icon: LifeBuoy, label: "Aide" },
];

export function AppSidebar() {
  const ftsLogo = "https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2FlogofaistasortieToulouse105.png?alt=media&token=4ed06e88-d01b-403c-8cff-049c5943c0e2";

  return (
    <aside className="w-64 h-full bg-[#F7DEEF] flex flex-col p-4 shadow-2xl">
      {/* Logo + SidebarTrigger + GoogleTranslate */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex-shrink-0">
            <Image src={ftsLogo} alt="FTS Logo" fill className="rounded-full object-cover" sizes="40px" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Fais ta Sortie</h2>
            <p className="text-xs text-gray-600">à Toulouse</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <SidebarTrigger iconSize={36} className="cursor-pointer z-20 relative" />
          <GoogleTranslate /> 
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const linkProps = item.external
            ? { href: item.href, target: "_blank", rel: "noopener noreferrer" }
            : { href: item.href };

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
