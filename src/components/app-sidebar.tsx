'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Facebook,
  Map,
  MessageSquare,
  // Les icônes pour les liens supprimés ont été commentées/supprimées
  LifeBuoy,
} from 'lucide-react';

import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
// REMPLACÉ : On n'importe plus les images de substitution (placeholderImages)
// import { placeholderImages } from '@/lib/placeholder-images'; 

// NOUVEAU LOGO : Définition directe de l'objet avec l'URL Firebase
const ftsLogo = {
  imageUrl: 'https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2FlogofaistasortieToulouse105.png?alt=media&token=4ed06e88-d01b-403c-8cff-049c5943c0e2',
  alt: 'FTS Logo',
};


const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
  {
    href: 'https://discord.com/channels/1422806103267344416/1422806103904882842',
    icon: MessageSquare,
    label: 'Sorties à Toulouse',
    external: true,
  },
  {
    href: 'https://discord.com/channels/1422806103267344416/1422806103904882842',
    icon: MessageSquare,
    label: 'Discussions',
    external: true,
  },
  { href: '/meetup', icon: Users, label: 'Événements Meetup' },
  { href: '/facebook', icon: Facebook, label: 'Groupes Facebook' },
  { href: '/map', icon: Map, label: 'Carte Interactive' },
  // Liens supprimés
  // { href: '/about', icon: Info, label: 'À Propos' }, 
  // { href: '/contact', icon: Mail, label: 'Nous contacter' },
  // { href: '/legal', icon: FileText, label: 'Mentions Légales' },
  // { href: '/terms', icon: BookText, label: "Charte d'utilisation" },
  // { href: '/privacy', icon: Shield, label: 'Politique de confidentialité' },
  { href: '/help', icon: LifeBuoy, label: 'Aide' },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 no-underline">
            {ftsLogo && (
              <Image
                src={ftsLogo.imageUrl} // C'est ici que l'image est utilisée
                alt="FTS Logo"
                width={40}
                height={40}
                // Optionnel : Si votre nouveau logo n'est pas censé être rond, vous pouvez enlever `className="rounded-full"`
                className="rounded-full" 
              />
            )}
            <div className="flex flex-col">
              <h2 className="font-headline text-lg font-semibold text-sidebar-foreground">Fais ta Sortie</h2>
              <p className="text-xs text-sidebar-foreground/80">à Toulouse</p>
            </div>
          </Link>
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={!item.external && (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)))}
                tooltip={{ children: item.label, side: 'right' }}
              >
                {item.external ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer">
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                ) : (
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button asChild>
          <a
            href="https://discord.com/channels/1422806103267344416/1422806103904882842"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageSquare />
            Rejoindre Discord
          </a>
        </Button>
      </SidebarFooter>
    </>
  );
}
