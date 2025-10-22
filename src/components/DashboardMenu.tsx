'use client';

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Download, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(prev => !prev);

  // Classes pour mobile
  const mobileMenuClasses = `absolute top-full left-0 w-64 bg-white shadow-lg p-4 z-50 md:hidden ${
    isOpen ? "block" : "hidden"
  }`;

  return (
    <div className="relative w-full">
      {/* MOBILE: Hamburger */}
      <div className="flex md:hidden justify-start">
        <button
          onClick={toggleMenu}
          className="p-2 rounded-lg text-gray-900 hover:bg-gray-100 transition focus:outline-none"
          aria-label="Ouvrir le menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div className={mobileMenuClasses}>
        <ul className="flex flex-col gap-2">
          {/* Boutons principaux */}
          <li>
            <Button asChild size="lg" className="w-full">
              <Link href="https://discord.com/channels/1422806103267344416/1422806103904882842" target="_blank">
                Pour commencer clique sur ce bouton
              </Link>
            </Button>
          </li>
          <li>
            <Button asChild size="lg" variant="outline" className="w-full">
              <Link href="https://discord.com/download" target="_blank">
                <Download className="mr-2 h-5 w-5" />
                Télécharger Discord
              </Link>
            </Button>
          </li>

          {/* Nouveau : logo FTST après le bouton */}
<li className="flex justify-center mt-2">
  {ftsLogoUrl && (
    <Image
      src={ftsLogoUrl}
      alt="Logo FTST"
      width={40}  // ajuste la taille si besoin
      height={40}
    />
  )}
</li>

          {/* Événements désactivés en dessous */}
          <li className="mt-2">
            <Button size="lg" variant="outline" disabled className="w-full mb-1">
              <PartyPopper className="mr-2 h-5 w-5" />
              Girls Party
            </Button>
            <Button size="lg" variant="outline" disabled className="w-full mb-1">
              <PartyPopper className="mr-2 h-5 w-5" />
              Student Event
            </Button>
            <Button size="lg" variant="outline" disabled className="w-full">
              <PartyPopper className="mr-2 h-5 w-5" />
              Rando Trip
            </Button>
          </li>
        </ul>
      </div>

      {/* DESKTOP: barre principale */}
      <div className="hidden md:flex flex-col gap-2 mt-4">
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="https://discord.com/channels/1422806103267344416/1422806103904882842" target="_blank">
              Pour commencer clique sur ce bouton
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="https://discord.com/download" target="_blank">
              <Download className="mr-2 h-5 w-5" />
              Télécharger Discord
            </Link>
          </Button>
        </div>
        <div className="flex gap-4 mt-2">
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
