'use client';

import { useState } from "react";
import Link from "next/link";
import { Download, PartyPopper, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import { StaticImageData } from "next/image";

interface DashboardMenuProps {
  ftsLogoUrl?: string | StaticImageData;
}

export function DashboardMenu({ ftsLogoUrl }: DashboardMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative w-full">
      {/* BOUTONS PRINCIPAUX TOUJOURS VISIBLES */}
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        <Button asChild size="lg" className="w-full md:w-auto">
          <Link
            href="https://discord.com/channels/1422806103267344416/1422806103904882842"
            target="_blank"
          >
            Pour commencer clique sur ce bouton
          </Link>
        </Button>

        <Button asChild size="lg" variant="outline" className="w-full md:w-auto">
          <Link href="https://discord.com/download" target="_blank">
            <Download className="mr-2 h-5 w-5" />
            Télécharger Discord
          </Link>
        </Button>

        {/* BOUTON POUR AFFICHER LA SIDEBAR MOBILE */}
        <Button
          onClick={() => setIsMenuOpen(true)}
          size="lg"
          variant="secondary"
          className="w-full md:hidden"
        >
          <Menu className="mr-2 h-5 w-5" />
          Afficher le menu
        </Button>
      </div>

      {/* SIDEBAR MOBILE */}
      <AppSidebar
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        ftsLogoUrl={ftsLogoUrl}
      />

      {/* RUBRIQUES VERSION DESKTOP */}
      <div className="hidden md:flex flex-col gap-2 mt-4">
        <div className="flex gap-4">
          <Button size="lg" variant="outline" disabled>
            <PartyPopper className="mr-2 h-5 w-5" />
            Girls Party
          </Button>
          <Button size="lg" variant="outline" disabled>
            <PartyPopper className="mr-2 h-5 w-5" />
            Student Event
          </Button>
          <Button size="lg" variant="outline" disabled>
            <PartyPopper className="mr-2 h-5 w-5" />
            Rando Trip
          </Button>
        </div>
      </div>
    </div>
  );
}
