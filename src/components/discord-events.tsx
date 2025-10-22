'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, Clock, Info, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from './ui/button';

interface DiscordEvent {
  id: string;
  name: string;
  scheduled_start_time: string;
  entity_metadata?: { location?: string };
}

export function DiscordEvents() {
  const [events, setEvents] = useState<DiscordEvent[] | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/discord', { cache: 'no-store' });
        const json = await res.json();
        setEvents(json.events ?? []);
      } catch {}
    };
    fetchEvents();
  }, []);

  if (!events) return <p>Chargement des événements Discord…</p>;
  if (events.length === 0) return <p>Aucun événement à venir pour le moment.</p>;

  const sortedEvents = events.sort((a, b) => new Date(a.scheduled_start_time).getTime() - new Date(b.scheduled_start_time).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Événements à venir</CardTitle>
        <CardDescription>Prochains événements du serveur Discord</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedEvents.map(event => (
          <div key={event.id} className="rounded-lg border bg-card p-4 shadow-sm mb-4">
            <h3 className="mb-2 font-semibold text-primary">{event.name}</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(event.scheduled_start_time), "EEEE d MMMM yyyy", { locale: fr })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{format(new Date(event.scheduled_start_time), "HH'h'mm", { locale: fr })}</span>
              </div>
              {event.entity_metadata?.location && (
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.entity_metadata.location)}`} target="_blank" className="underline text-primary">{event.entity_metadata.location}</a>
                </div>
              )}
            </div>
            <Button asChild size="sm" variant="outline" className="mt-4">
              <a href={`https://discord.com/events/1422806103267344416/${event.id}`} target="_blank" rel="noopener noreferrer">
                Voir sur Discord <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
