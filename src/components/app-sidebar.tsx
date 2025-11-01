"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Zap, ExternalLink, Mountain, Footprints } from 'lucide-react';
import { Facebook, Calendar, Bus, LayoutDashboard, Users, MessageSquare, Car } from "lucide-react";
import { Map, LifeBuoy } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import GoogleTranslate from '@/components/GoogleTranslate';

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
  const ftsLogo = "/icons/faistasortielogo192OK.png";

  return (
    <aside className="w-64 h-full bg-[#F7DEEF] flex flex-col p-4 pt-10 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <Link href={{ pathname: "/" }} className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex-shrink-0">
            <Image
              src={ftsLogo}
              alt="FTS Logo"
              fill
              className="rounded-full object-cover"
              sizes="40px"
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Fais ta Sortie</h2>
            <p className="text-xs text-gray-600">à Toulouse</p>
          </div>
        </Link>

        <SidebarTrigger className="lg:hidden cursor-pointer" />
      </div>

      <nav className="flex-1 flex flex-col gap-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          // Si lien externe, utiliser <a>, sinon <Link>
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
            <Link
              key={item.label}
              href={{ pathname: item.href }} // <-- correction ici
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-purple-200"
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
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
    </aside>
  );
}
