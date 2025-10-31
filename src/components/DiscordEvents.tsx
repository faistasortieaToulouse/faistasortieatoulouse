'use client';

import { DiscordEvent } from '@/types/types';
import Image from 'next/image';

interface DiscordEventsProps {
  events: DiscordEvent[];
}

export function DiscordEvents({ events }: DiscordEventsProps) {
  if (!events || events.length === 0) {
    return <p className="text-muted-foreground">Aucun événement prévu pour le moment.</p>;
  }

  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {events.map((event) => {
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
          <li key={event.id} className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
{event.image && (
  <div className="relative w-full h-48">
    <Image
      src={`https://cdn.discordapp.com/guild-events/${event.id}/${event.image}.png`}
      alt={`Image de ${event.name}`}
      fill
      className="object-cover"
      unoptimized
    />
  </div>
)}
            <div className="p-4">
              <h3 className="text-lg font-bold text-primary">{event.name}</h3>
              <p className="text-sm text-muted-foreground">
                📅 {formattedDate} à {formattedTime}
              </p>
              {event.entity_metadata?.location && (
                <p className="text-sm text-muted-foreground">📍 {event.entity_metadata.location}</p>
              )}
              {event.description && (
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {event.description}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
