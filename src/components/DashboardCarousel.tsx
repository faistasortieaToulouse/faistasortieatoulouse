// src/components/DashboardCarousel.tsx
'use client';

import DashboardClient from '@/components/DashboardClient';
import { CarouselImage, DiscordChannel, DiscordEvent, DiscordWidgetData } from '@/types/types';

// --- Constantes globales ---
const GUILD_ID = '1422806103267344416';
const FTS_LOGO_URL =
  'https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2FlogoFTS650bas.jpg?alt=media&token=a8b14c5e-5663-4754-a2fa-149f9636909c';

// --- Détection de l’origine actuelle (utile pour mobile ou build static) ---
const BASE_URL =
  typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL || ''; // Optionnel pour build SSR

// --- Liste complète des images du carrousel ---
const IMAGE_NAMES = [
  'https://faistasortieatoulouse.vercel.app/images/bar600.jpg',
  'https://faistasortieatoulouse.vercel.app/images/baton600.jpg',
  'https://faistasortieatoulouse.vercel.app/images/cinema600.jpg',
  'https://faistasortieatoulouse.vercel.app/images/concert600.jpg',
  'https://faistasortieatoulouse.vercel.app/images/covoiturage600.jpg',
  'https://faistasortieatoulouse.vercel.app/images/danse600.jpg',
  'https://faistasortieatoulouse.vercel.app/images/emploi600.jpg',
  'https://faistasortieatoulouse.vercel.app/images/jeu600.jpg',
  'https://faistasortieatoulouse.vercel.app/images/lecture600.jpg',
  'https://faistasortieatoulouse.vercel.app/images/logement600.jpg',
  'https://faistasortieatoulouse.vercel.app/images/musee600.jpg',
  'https://faistasortieatoulouse.vercel.app/images/peinture600.jpg',
  'https://faistasortieatoulouse.vercel.app/images/photo600.jpg',
  'https://faistasortieatoulouse.vercel.app/images/piquenique600.jpg',
  'https://faistasortieatoulouse.vercel.app/images/plage600.jpg',
  'https://faistasortieatoulouse.vercel.app/images/rando600.jpg',
  'https://faistasortieatoulouse.vercel.app/images/restaurant600.jpg',
  'https://faistasortieatoulouse.vercel.app/images/salondethe600.jpg',
  'https://faistasortieatoulouse.vercel.app/images/theatre600.jpg', // correction probable de "tehatre600.jpg"
  'https://faistasortieatoulouse.vercel.app/images/yoga600.jpg',
  'https://faistasortieatoulouse.vercel.app/images/zumba600.jpg',
];

// --- Composant principal ---
export default function DashboardCarousel() {
  // URLs absolues vers le dossier public/images/
  const images: CarouselImage[] = IMAGE_NAMES.map((name, index) => ({
    id: `img-${index}`,
    imageUrl: `${BASE_URL}/images/${name}`,
    description: `Image ${index + 1}`,
  }));

  const widgetData: DiscordWidgetData & { presence_count?: number } = {
    channels: [] as DiscordChannel[],
    events: [] as DiscordEvent[],
    images,
    guildId: GUILD_ID,
    presence_count: 0,
  };

  return (
    <DashboardClient
      discordData={widgetData}
      eventsData={widgetData.events}
      discordPolls={[]}
      totalMembers={0}
      ftsLogoUrl={FTS_LOGO_URL}
    />
  );
}
