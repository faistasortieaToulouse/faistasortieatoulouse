'use client';

import { DiscordEvent } from '@/types/types';
import Image from 'next/image';
import Link from 'next/link';

interface DiscordEventsProps {
  events: DiscordEvent[];
  limit?: number;
}

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
                <div className="relative w-full h-24 sm:h-28 md:h-32">
                  <Image
                    src={
                      event.image
                        ? `https://cdn.discordapp.com/guild-events/${event.id}/${event.image}.png`
                        : '/images/event-placeholder.jpg' // ✅ Image par défaut
                    }
                    alt={`Image de ${event.name}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
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
