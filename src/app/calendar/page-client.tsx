'use client';

import { useState, useMemo } from 'react';
import { fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, MapPin } from 'lucide-react';

interface DiscordEvent {
  id: string;
  name: string;
  scheduled_start_time: string;
  description?: string;
  entity_type?: 1 | 2 | 3; // 3 = événement avec adresse
  entity_metadata?: { location?: string } | null;
}

interface CalendarClientProps {
  eventsData: DiscordEvent[];
  upcomingEvents: DiscordEvent[];
}

// Formattage de la date et heure
const formatEventTime = (isoString: string) => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Récupérer le lieu de l'événement
const getEventLocation = (event: DiscordEvent) => {
  if (event.entity_type === 3 && event.entity_metadata?.location) {
    return event.entity_metadata.location;
  } else if (event.entity_type === 2) {
    return 'Salon Vocal';
  } else if (event.entity_type === 1) {
    return 'Salon Stage';
  }
  return 'Lieu non spécifié';
};

// Récupérer le lien Google Maps si adresse physique
const getEventLocationLink = (event: DiscordEvent) => {
  const location = event.entity_metadata?.location;
  if (event.entity_type === 3 && location) {
    return location.startsWith('http')
      ? location
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  }
  return null;
};

export default function CalendarClient({ eventsData, upcomingEvents }: CalendarClientProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Préparer les événements pour le calendrier
  const calendarEvents = useMemo(
    () => eventsData.map(e => ({
      title: e.name,
      date: new Date(e.scheduled_start_time), // <-- "date" utilisé pour compatibilité calendrier
    })),
    [eventsData]
  );

  // Liste complète triée
  const allEvents = useMemo(
    () => (eventsData || []).slice().sort(
      (a, b) => new Date(a.scheduled_start_time).getTime() - new Date(b.scheduled_start_time).getTime()
    ),
    [eventsData]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Calendrier */}
      <div className="lg:col-span-2 bg-card p-6 rounded-xl shadow-lg border flex flex-col items-center">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-card-foreground">
          <CalendarIcon className="h-6 w-6 text-primary" />
          Vue Mensuelle des Événements
        </h2>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={fr}
          events={calendarEvents} // <-- points visibles
          className="rounded-xl border shadow bg-card"
        />
      </div>

      {/* Liste complète des événements */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <h2 className="text-2xl font-semibold mb-2 text-card-foreground">
          Liste Complète des Événements
        </h2>
        <div className="bg-card rounded-xl shadow-lg p-4 border max-h-[600px] overflow-y-auto">
          {allEvents.length === 0 && (
            <p className="text-muted-foreground text-center py-4">
              Aucun événement Discord trouvé.
            </p>
          )}
          {allEvents.map(event => {
            const location = getEventLocation(event);
            const link = getEventLocationLink(event);

            return (
              <div
                key={event.id}
                className="mb-3 p-3 border-b last:border-b-0 hover:bg-secondary/50 rounded-md transition-colors"
              >
                <p className="font-bold text-lg text-primary">{event.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatEventTime(event.scheduled_start_time)}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-green-600" />
                  {link ? (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {location}
                    </a>
                  ) : (
                    location
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
