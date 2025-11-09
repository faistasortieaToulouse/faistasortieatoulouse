'use client';

import { useState } from "react";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { Download, PartyPopper, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardMenuProps {
  ftsLogoUrl?: string | StaticImageData;
}

export function DashboardMenu({ ftsLogoUrl }: DashboardMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(prev => !prev);

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

        {/* BOUTON POUR AFFICHER LE MENU */}
        <Button
          onClick={toggleMenu}
          size="lg"
          variant="secondary"
          className="w-full md:hidden"
        >
          {isMenuOpen ? (
            <>
              <X className="mr-2 h-5 w-5" />
              Fermer le menu
            </>
          ) : (
            <>
              <Menu className="mr-2 h-5 w-5" />
              Afficher le menu
            </>
          )}
        </Button>
      </div>

      {/* MENU DÉROULANT MOBILE */}
      {isMenuOpen && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md md:hidden">
          {/* Logo FTST */}
          {ftsLogoUrl && (
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 relative">
                <Image
                  src={ftsLogoUrl}
                  alt="Logo FTST"
                  fill
                  style={{ objectFit: "contain" }}
                  sizes="40px"
                  unoptimized
                />
              </div>
            </div>
          )}

          {/* Événements désactivés */}
          <div className="flex flex-col gap-2">
            <Button size="lg" variant="outline" disabled className="w-full">
              <PartyPopper className="mr-2 h-5 w-5" />
              Girls Party
            </Button>
            <Button size="lg" variant="outline" disabled className="w-full">
              <PartyPopper className="mr-2 h-5 w-5" />
              Student Event
            </Button>
            <Button size="lg" variant="outline" disabled className="w-full">
              <PartyPopper className="mr-2 h-5 w-5" />
              Rando Trip
            </Button>
          </div>
        </div>
      )}

      {/* VERSION DESKTOP */}
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
