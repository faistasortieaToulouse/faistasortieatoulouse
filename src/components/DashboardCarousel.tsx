// src/components/DashboardCarousel.tsx
'use client';

import DashboardClient from '@/components/DashboardClient';
import { CarouselImage, DiscordChannel, DiscordEvent, DiscordWidgetData } from '@/types/types';

// --- Constantes globales ---
const GUILD_ID = '1422806103267344416';
const FTS_LOGO_URL =
  'https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2FlogoFTS650bas.jpg?alt=media&token=a8b14c5e-5663-4754-a2fa-149f9636909c';

// --- Liste complète des images du carrousel ---
const CAROUSEL_IMAGES: string[] = [
  '/images/bar600.jpg',
  '/images/baton600.jpg',
  '/images/cinema600.jpg',
  '/images/concert600.jpg',
  '/images/covoiturage600.jpg',
  '/images/danse600.jpg',
  '/images/emploi600.jpg',
  '/images/jeu600.jpg',
  '/images/lecture600.jpg',
  '/images/logement600.jpg',
  '/images/musee600.jpg',
  '/images/peinture600.jpg',
  '/images/photo600.jpg',
  '/images/piquenique600.jpg',
  '/images/plage600.jpg',
  '/images/rando600.jpg',
  '/images/restaurant600.jpg',
  '/images/salondethe600.jpg',
  '/images/tehatre600.jpg',
  '/images/yoga600.jpg',
  '/images/zumba600.jpg',
];


// --- Composant principal ---
export default function DashboardCarousel() {
  // Conversion des URLs en CarouselImage
  const images: CarouselImage[] = CAROUSEL_IMAGES.map((url, index) => ({
    id: `img-${index}`,
    imageUrl: url,
    description: '', // Description vide par défaut
  }));

  // --- Création d'un objet DiscordWidgetData complet ---
  const widgetData: DiscordWidgetData & { presence_count?: number } = {
    channels: [] as DiscordChannel[], // vide pour le carrousel
    events: [] as DiscordEvent[],     // vide pour le carrousel
    images,
    guildId: GUILD_ID,
    presence_count: 0,                // optionnel
  };

  return (
    <DashboardClient
      discordData={widgetData}    // ✅ passe l'objet complet
      eventsData={widgetData.events}
      discordPolls={[]}            // vide si aucun sondage
      totalMembers={0}             // nombre fictif ou réel si disponible
      ftsLogoUrl={FTS_LOGO_URL}    // logo FTS
    />
  );
}
