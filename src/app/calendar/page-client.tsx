'use client';

import { useState } from 'react';
import { fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Plus, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface DiscordEvent {
  id: string;
  name: string;
  scheduled_start_time: string;
  description?: string;
}

interface CalendarClientProps {
  eventsData: DiscordEvent[]; // Tous les événements
  upcomingEvents: DiscordEvent[];
}

const formatEventTime = (isoString: string) => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export default function CalendarClient({ eventsData, upcomingEvents }: CalendarClientProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Liste complète triée
  const allEvents = (eventsData || []).slice().sort(
    (a, b) => new Date(a.scheduled_start_time).getTime() - new Date(b.scheduled_start_time).getTime()
  );

  // Tous les jours avec événements pour le calendrier
  const eventDays = (eventsData || []).map(e => new Date(e.scheduled_start_time));


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
  events={eventsData}   // <-- C'est cette prop qui est incorrecte
  className="rounded-xl border shadow bg-card"
/>

      </div>

      {/* Liste complète des événements */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <h2 className="text-2xl font-semibold mb-2 text-card-foreground">
          Liste Complète des Événements
        </h2>
        <div className="bg-card rounded-xl shadow-lg p-4 border max-h-[600px] overflow-y-auto">
          {allEvents.map(event => (
            <div
              key={event.id}
              className="mb-3 p-3 border-b last:border-b-0 hover:bg-secondary/50 rounded-md transition-colors"
            >
              <p className="font-bold text-lg text-primary">{event.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatEventTime(event.scheduled_start_time)}
              </p>
            </div>
          ))}
          {allEvents.length === 0 && (
            <p className="text-muted-foreground text-center py-4">
              Aucun événement Discord trouvé.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
