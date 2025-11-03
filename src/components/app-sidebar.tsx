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
export function AppSidebar() {
  const [logoSrc, setLogoSrc] = useState(EXTERNAL_LOGO);
  const [collapsed, setCollapsed] = useState(false);

  const handleImageError = () => {
    if (logoSrc === EXTERNAL_LOGO) setLogoSrc(LOCAL_LOGO);
  };

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <aside
      className={`h-full bg-[#F7DEEF] flex flex-col p-4 pt-10 shadow-2xl transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
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

        <SidebarTrigger collapsed={collapsed} onClick={toggleSidebar} />
      </div>

      <nav className="flex-1 flex flex-col gap-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
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
                {!collapsed && item.label}
              </a>
            );
          }

          return (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-purple-200"
            >
              <Icon className="w-5 h-5" />
              {!collapsed && item.label}
            </a>
          );
        })}

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

      <div className="mt-4 pt-4 border-t border-purple-300">
        <p className="text-sm text-gray-600 italic">Traduction (simulée)</p>
      </div>
    </aside>
  );
}
