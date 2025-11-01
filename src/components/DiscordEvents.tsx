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
const DEFAULT_IMAGE_FALLBACK = '/images/EvenentnotFTS.jpg'; 

// Composant pour l'image de l'événement avec gestion d'erreur et priorité de chargement
const EventImage: React.FC<{ event: DiscordEvent, index: number }> = ({ event, index }) => {
    // 1. Détermine l'URL Discord initiale (on réintroduit ?size=256 pour réduire le poids de l'image source)
    const initialDiscordUrl = event.image
      ? `https://cdn.discordapp.com/guild-events/${event.id}/${event.image}.png?size=256`
      : DEFAULT_IMAGE_FALLBACK;
      
    // 2. État pour la source actuelle de l'image (démarre avec Discord ou le fallback par défaut)
    const [currentImageSrc, setCurrentImageSrc] = useState(initialDiscordUrl);
    
    // 3. Gestion d'erreur: bascule vers l'image par défaut si l'image Discord échoue
    const handleImageError = () => {
        // Log l'erreur pour aider au débogage
        console.error("Erreur de chargement d'image pour l'événement:", event.name, "URL tentée:", currentImageSrc);

        // Si l'URL actuelle n'est pas déjà l'image de secours, on la définit.
        if (currentImageSrc.startsWith('https://cdn.discordapp.com')) {
            setCurrentImageSrc(DEFAULT_IMAGE_FALLBACK);
        } 
    };
    
    // Déterminer si l'image doit être chargée en priorité (les 3 premières images)
    const shouldLoadPriority = index < 3; 

    // 4. Rendu de l'image (maintenez les dimensions dans le conteneur parent)
    const imageSizes = `
        (max-width: 640px) 100vw,   // 1 colonne sur mobile
        (max-width: 1024px) 50vw,  // 2 colonnes sur tablette
        33vw                      // 3 colonnes sur desktop
    `;

    // Vérifie si l'événement a une image ou si nous sommes sur l'image par défaut.
    const hasValidImage = event.image || currentImageSrc === DEFAULT_IMAGE_FALLBACK;
    
    // Si nous n'avons ni image Discord, ni image de secours chargée (après une potentielle erreur), 
    // affichez un conteneur vide pour éviter un crash.
    if (!hasValidImage && !event.image) {
        return (
            <div className="relative w-full h-24 sm:h-28 md:h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 p-2 text-center">Image non disponible</p>
            </div>
        );
    }


    return (
        <div className="relative w-full h-24 sm:h-28 md:h-32">
            <Image
                src={currentImageSrc}
                alt={`Image de ${event.name}`}
                fill
                className="object-cover"
                unoptimized // <-- Réactivé pour éviter l'erreur de configuration Next.js
                loading={shouldLoadPriority ? 'eager' : 'lazy'} // Chargement prioritaire pour les premières images
                priority={shouldLoadPriority} // Attribut priority pour le LCP
                // Ajout de l'attribut sizes pour indiquer au navigateur la taille de l'image
                sizes={imageSizes}
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
          {displayedEvents.map((event, index) => {
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
                {/* Utilisation du nouveau composant EventImage, passage de l'index */}
                <EventImage event={event} index={index} />

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
