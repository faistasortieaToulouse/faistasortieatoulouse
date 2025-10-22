'use client';

import { useEffect, useState, useMemo } from 'react';
import { fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, MapPin, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ... (interfaces et fonctions utilitaires identiques)

export default function CalendarClient({ eventsData, upcomingEvents }: CalendarClientProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [hasReloaded, setHasReloaded] = useState(false);

  // Liste complète triée
  const allEvents = useMemo(
    () =>
      (eventsData || []).slice().sort(
        (a, b) => new Date(a.scheduled_start_time).getTime() - new Date(b.scheduled_start_time).getTime()
      ),
    [eventsData]
  );

  // ✅ Rafraîchissement automatique si aucun événement détecté après 5 secondes
  useEffect(() => {
    if ((!eventsData || eventsData.length === 0) && !hasReloaded) {
      const timeout = setTimeout(() => {
        console.log("🔄 Aucun événement détecté — tentative automatique de rechargement...");
        sessionStorage.setItem('calendar-auto-reload', 'true');
        setHasReloaded(true);
        window.location.reload();
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [eventsData, hasReloaded]);

  // ✅ Supprimer le flag si les données se chargent bien
  useEffect(() => {
    if (eventsData && eventsData.length > 0) {
      sessionStorage.removeItem('calendar-auto-reload');
    }
  }, [eventsData]);

  // ✅ Bouton manuel "Rafraîchir"
  const handleManualRefresh = () => {
    sessionStorage.removeItem('calendar-auto-reload');
    window.location.reload();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Calendrier */}
      <div className="lg:col-span-2 bg-card p-6 rounded-xl shadow-lg border flex flex-col items-center">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-card-foreground">
          <CalendarIcon className="h-6 w-6 text-primary" />
          Vue Mensuelle des Événements
        </h2>

        {(!eventsData || eventsData.length === 0) ? (
          <div className="flex flex-col items-center justify-center text-center py-12 space-y-4">
            <p className="text-muted-foreground">Aucun événement détecté pour le moment...</p>
            <Button onClick={handleManualRefresh} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Rafraîchir
            </Button>
          </div>
        ) : (
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={fr}
            events={eventsData}
            className="rounded-xl border shadow bg-card"
          />
        )}
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
                <p className="text-sm text-muted-foreground">{formatEventTime(event.scheduled_start_time)}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-green-600" />
                  {link ? (
                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
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
