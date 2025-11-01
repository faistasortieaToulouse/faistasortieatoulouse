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
    
    // Détermine l'URL Discord (avec taille réduite ET format JPG pour la légèreté) si elle existe.
    // Changement de .png à .jpg pour optimiser le poids du fichier.
    const discordUrl = event.image
      ? `https://cdn.discordapp.com/guild-events/${event.id}/${event.image}.jpg?size=256`
      : null; // Utiliser null si Discord n'a pas d'image
      
    // 1. Détermine la source initiale : Si Discord n'a pas d'URL, on utilise directement l'image de secours.
    const initialSrc = discordUrl || DEFAULT_IMAGE_FALLBACK;

    // 2. État pour la source actuelle de l'image (démarre avec Discord si disponible, sinon le fallback)
    const [currentImageSrc, setCurrentImageSrc] = useState(initialSrc);
    
    // 3. Gestion d'erreur: bascule vers l'image par défaut si l'image Discord échoue
    const handleImageError = () => {
        // Log l'erreur pour aider au débogage
        console.error("Erreur de chargement d'image pour l'événement:", event.name, "URL tentée:", currentImageSrc);

        // Si l'URL actuelle est l'URL Discord et qu'elle a échoué, on passe au Fallback.
        if (currentImageSrc === discordUrl) {
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
    
    // Vérification de base pour s'assurer que currentImageSrc n'est jamais vide
    if (!currentImageSrc) {
        return (
            <div className="relative w-full h-24 sm:h-28 md:h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 p-2 text-center">Image non trouvée</p>
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
                unoptimized // Maintenu pour éviter l'erreur de configuration Next.js
                loading={shouldLoadPriority ? 'eager' : 'lazy'} 
                priority={shouldLoadPriority}
                sizes={imageSizes}
                // Gère l'erreur de chargement pour passer au fallback
                // Note : On n'appelle handleImageError que si on est en train de charger l'URL Discord.
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
