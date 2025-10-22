'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Info, ExternalLink, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from './ui/button';

interface DiscordEvent {
  id: string;
  name: string;
  scheduled_start_time: string;
  channel_id: string;
  entity_metadata?: {
    location?: string;
  };
}

export function DiscordEvents({ events }: { events?: DiscordEvent[] }) {
  const sortedEvents = events?.sort(
    (a, b) => new Date(a.scheduled_start_time).getTime() - new Date(b.scheduled_start_time).getTime()
  );

  // ✅ Auto-refresh si aucun événement (avec sécurité pour éviter boucle infinie)
  useEffect(() => {
    if (!events || events.length === 0) {
      const alreadyRetried = sessionStorage.getItem('discord-events-retry');
      if (!alreadyRetried) {
        console.log('🔄 Aucun événement trouvé, tentative de rechargement automatique dans 4 secondes...');
        const timer = setTimeout(() => {
          sessionStorage.setItem('discord-events-retry', 'true');
          window.location.reload();
        }, 4000);
        return () => clearTimeout(timer);
      } else {
        console.warn('⚠️ Aucun événement trouvé après rechargement, arrêt des tentatives automatiques.');
      }
    } else {
      // ✅ Réinitialise la protection si les événements se chargent correctement
      sessionStorage.removeItem('discord-events-retry');
    }
  }, [events]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Événements à venir</CardTitle>
        <CardDescription>
          Voici les prochains événements prévus sur le serveur Discord.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sortedEvents && sortedEvents.length > 0 ? (
          <div className="space-y-4">
            {sortedEvents.map((event) => (
              <div key={event.id} className="rounded-lg border bg-card p-4 shadow-sm">
                <h3 className="mb-2 font-semibold text-primary">{event.name}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {/* Date */}
                  <div className="flex items-start gap-2">
                    <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>
                      {format(new Date(event.scheduled_start_time), 'EEEE d MMMM yyyy', { locale: fr })}
                    </span>
                  </div>
                  {/* Heure */}
                  <div className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>
                      {format(new Date(event.scheduled_start_time), "HH'h'mm", { locale: fr })}
                    </span>
                  </div>
                  {/* Lieu avec lien Google Maps */}
                  {event.entity_metadata?.location && (
                    <div className="flex items-start gap-2">
                      <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          event.entity_metadata.location
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-primary hover:text-primary/80"
                      >
                        📍 {event.entity_metadata.location}
                      </a>
                    </div>
                  )}
                </div>

                <Button asChild size="sm" variant="outline" className="mt-4">
                  <a
                    href={`https://discord.com/events/1422806103267344416/${event.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Voir sur Discord
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          // 🔄 Affichage si aucun événement
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
            <p className="mb-2">Aucun événement à venir pour le moment.</p>
            <Button
              onClick={() => {
                sessionStorage.removeItem('discord-events-retry');
                window.location.reload();
              }}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              <RefreshCw className="mr-2 h-4 w-4 animate-spin-slow" />
              Rafraîchir
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
