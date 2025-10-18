'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MapPin, Info, Loader2, Calendar, Clock, ExternalLink, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DiscordEvent {
  id: string;
  name: string;
  scheduled_start_time: string;
  channel_id: string | null;
  entity_type: 1 | 2 | 3;
  entity_metadata: { location?: string } | null;
}

interface MappedEvent extends DiscordEvent {
  position: { lat: number; lng: number };
  isGeocoded: boolean;
  geocodeStatus: 'OK' | 'IGNORED' | 'NOT_FOUND';
}

interface MapClientProps {
  initialEvents: DiscordEvent[];
}

const TOULOUSE_CENTER = { lat: 43.6047, lng: 1.4442 };
const GUILD_ID = '1422806103267344416';

export default function MapClient({ initialEvents }: MapClientProps) {
  const [mappedEvents, setMappedEvents] = useState<MappedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  const addressEvents = useMemo(
    () => initialEvents.filter(e => e.entity_type === 3 && !!e.entity_metadata?.location?.trim()),
    [initialEvents]
  );

  const geocodeAll = useCallback(async () => {
    const temp: MappedEvent[] = [];

    for (const event of addressEvents) {
      const location = event.entity_metadata?.location?.trim();
      if (!location) continue;

      try {
        const res = await fetch(`/api/geocode?address=${encodeURIComponent(location)}`);
        const data = await res.json();

        let status: 'OK' | 'IGNORED' | 'NOT_FOUND' = 'NOT_FOUND';

        if (data.status === 'OK' && data.results.length > 0) {
          status = 'OK';
          temp.push({ ...event, position: data.results[0], isGeocoded: true, geocodeStatus: status });
          console.log(`✅ Géocodé : "${location}" → lat:${data.results[0].lat}, lng:${data.results[0].lng}`);
        } else if (data.status === 'IGNORED') {
          status = 'IGNORED';
          console.warn(`⚠️ Ignoré (hors Haute-Garonne) : "${location}"`);
        } else {
          console.warn(`❌ Adresse introuvable : "${location}"`);
        }

      } catch (err) {
        console.error(`Erreur géocodage "${location}"`, err);
      }
    }

    setMappedEvents(temp);
    setLoading(false);
  }, [addressEvents]);

  useEffect(() => {
    geocodeAll();
  }, [geocodeAll]);

  useEffect(() => {
    if (loading || !mapRef.current || mappedEvents.length === 0) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: TOULOUSE_CENTER,
        zoom: 12,
        gestureHandling: 'greedy',
      });
    }

    const map = mapInstanceRef.current;
    const bounds = new google.maps.LatLngBounds();

    mappedEvents.forEach(ev => {
      const pos = new google.maps.LatLng(ev.position.lat, ev.position.lng);
      bounds.extend(pos);
      new google.maps.Marker({
        position: pos,
        map,
        title: ev.name,
      });
    });

    map.fitBounds(bounds);
  }, [loading, mappedEvents]);

  const handleRefresh = useCallback(() => window.location.reload(), []);

  const renderMapStatus = () => {
    if (loading) {
      return (
        <div className="h-96 flex flex-col justify-center items-center">
          <Loader2 className="animate-spin h-10 w-10 mb-4" /> Chargement de la carte et géocodage…
        </div>
      );
    }

    if (mappedEvents.length === 0) {
      return (
        <Alert className="h-96 flex flex-col justify-center items-center text-center p-6">
          <Info className="h-8 w-8 mb-3 text-blue-500" />
          <AlertTitle>Aucun événement localisable</AlertTitle>
          <AlertDescription>
            Aucun événement avec adresse physique n’a été trouvé ou toutes sont hors Haute-Garonne.
          </AlertDescription>
          <Button onClick={handleRefresh} className="mt-2">Rafraîchir</Button>
        </Alert>
      );
    }

    return <div ref={mapRef} style={{ width: '100%', height: '500px' }} />;
  };

  const getLocationDetails = (event: DiscordEvent) => {
    if (event.entity_type === 3) {
      const location = event.entity_metadata?.location?.trim();
      return {
        icon: <MapPin className="h-4 w-4 text-green-600" />,
        text: location || 'Lieu non spécifié',
        link: location
          ? location.startsWith('http')
            ? location
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
          : '#',
        isMappable: !!location,
      };
    }
    const type = event.entity_type === 2 ? 'Salon Vocal' : 'Salon Stage';
    return {
      icon: <Mic className="h-4 w-4 text-indigo-500" />,
      text: type,
      link: `https://discord.com/events/${GUILD_ID}/${event.id}`,
      isMappable: false,
    };
  };

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardContent className="p-0">{renderMapStatus()}</CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Liste des événements à venir</CardTitle>
          <CardDescription>Y compris ceux sans localisation mappable.</CardDescription>
        </CardHeader>
        <CardContent className="max-h-[400px] overflow-y-auto space-y-4 p-4">
          {initialEvents.length === 0 ? (
            <p className="text-muted-foreground">Aucun événement trouvé.</p>
          ) : (
            initialEvents.map(ev => {
              const details = getLocationDetails(ev);
              return (
                <div key={ev.id} className="rounded-lg border bg-card p-4 shadow-sm hover:shadow-md">
                  <h3 className="mb-2 font-semibold text-primary">{ev.name}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Calendar className="mt-0.5 h-4 w-4" />
                      <span>{format(new Date(ev.scheduled_start_time), 'EEEE d MMMM yyyy', { locale: fr })}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="mt-0.5 h-4 w-4" />
                      <span>{format(new Date(ev.scheduled_start_time), "HH'h'mm", { locale: fr })}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      {details.icon}
                      <a
                        href={details.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={details.isMappable ? 'text-blue-600 hover:text-blue-800 underline flex items-center' : 'text-foreground font-medium flex items-center'}
                      >
                        {details.text}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline" className="mt-4 bg-primary hover:bg-primary/90 text-white border-primary">
                    <a href={`https://discord.com/events/${GUILD_ID}/${ev.id}`} target="_blank" rel="noopener noreferrer">
                      Voir sur Discord <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
