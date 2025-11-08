'use client';

import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { Download, PartyPopper, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardMenuProps {
  ftsLogoUrl?: string | StaticImageData;
}

export function DashboardMenu({ ftsLogoUrl }: DashboardMenuProps) {
  return (
    <div className="relative w-full">
      {/* BOUTONS TOUJOURS VISIBLES (mobile + desktop) */}
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

        {/* Bouton d'accès au menu */}
        <Button size="lg" variant="secondary" className="w-full md:w-auto">
          <Menu className="mr-2 h-5 w-5" />
          Afficher le menu
        </Button>
      </div>

      {/* LOGO FTST */}
      {ftsLogoUrl && (
        <div className="flex justify-center mt-4">
          <div className="w-10 h-10 md:w-12 md:h-12 relative">
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

      {/* ÉVÉNEMENTS DÉSACTIVÉS */}
      <div className="flex flex-col md:flex-row gap-2 mt-4">
        <Button size="lg" variant="outline" disabled className="w-full md:w-auto">
          <PartyPopper className="mr-2 h-5 w-5" />
          Girls Party
        </Button>
        <Button size="lg" variant="outline" disabled className="w-full md:w-auto">
          <PartyPopper className="mr-2 h-5 w-5" />
          Student Event
        </Button>
        <Button size="lg" variant="outline" disabled className="w-full md:w-auto">
          <PartyPopper className="mr-2 h-5 w-5" />
          Rando Trip
        </Button>
      </div>
    </div>
  );
}
