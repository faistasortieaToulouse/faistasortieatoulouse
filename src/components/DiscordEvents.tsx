'use client';

import { DiscordEvent } from '@/types/types';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

interface DiscordEventsProps {
  events: DiscordEvent[];
  limit?: number;
}

// Chemin vers l'image par défaut qui sera utilisée si l'image Discord est manquante ou échoue
// J'utilise une image intermédiaire pour la gestion d'erreur afin de garantir une taille uniforme.
const DEFAULT_IMAGE_FALLBACK = '/images/EvenentnotFTS.jpg'; 

// Composant pour l'image de l'événement avec gestion d'erreur
const EventImage: React.FC<{ event: DiscordEvent }> = ({ event }) => {
    // 1. Détermine l'URL Discord initiale
    const initialDiscordUrl = event.image
      ? `https://cdn.discordapp.com/guild-events/${event.id}/${event.image}.png`
      : DEFAULT_IMAGE_FALLBACK;
      
    // 2. État pour la source actuelle de l'image (démarre avec Discord ou le fallback par défaut)
    const [currentImageSrc, setCurrentImageSrc] = useState(initialDiscordUrl);
    
    // 3. Gestion d'erreur: bascule vers l'image par défaut si l'image Discord échoue
    const handleImageError = () => {
        // Bascule vers l'image locale uniquement si nous essayions l'image Discord
        if (currentImageSrc.startsWith('https://cdn.discordapp.com')) {
            setCurrentImageSrc(DEFAULT_IMAGE_FALLBACK);
        }
    };
    
    // 4. Rendu de l'image (maintenez les dimensions dans le conteneur parent)
    return (
        <div className="relative w-full h-16 sm:h-20 md:h-24"> 
            <Image
                src={currentImageSrc}
                alt={`Image de ${event.name}`}
                fill
                className="object-cover"
                // Désactive l'optimisation Next.js pour éviter les problèmes avec les CDN externes (Discord)
                unoptimized
                // Gère l'erreur de chargement pour passer au fallback
                onError={handleImageError}
            />
        </div>
    );
};


export function DiscordEvents({ events, limit }: DiscordEventsProps) {
  // 🔃 Tri chronologique
  const sortedEvents = [...events].sort(
    (a, b) =>
      new Date(a.scheduled_start_time).getTime() -
      new Date(b.scheduled_start_time).getTime()
  );

  // 🧮 Limite optionnelle
  const displayedEvents = limit ? sortedEvents.slice(0, limit) : sortedEvents;

  if (!displayedEvents || displayedEvents.length === 0) {
    return <p className="text-muted-foreground">Aucun événement prévu pour le moment.</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="max-h-[700px] overflow-y-auto p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-md">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedEvents.map((event) => {
            const startDate = new Date(event.scheduled_start_time);
            const formattedDate = startDate.toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            });
            const formattedTime = startDate.toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <li
                key={event.id}
                className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
              >
                {/* Utilisation du nouveau composant EventImage */}
                <EventImage event={event} />

                <div className="p-3 flex flex-col gap-2">
                  <h3 className="text-base font-semibold text-primary">{event.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    📅 {formattedDate} à {formattedTime}
                  </p>
                  {event.entity_metadata?.location && (
                    <p className="text-sm text-muted-foreground">📍 {event.entity_metadata.location}</p>
                  )}
                  {event.guild_id && (
                    <Link
                      href={`https://discord.com/events/${event.guild_id}/${event.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      🔗 Voir sur Discord
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
