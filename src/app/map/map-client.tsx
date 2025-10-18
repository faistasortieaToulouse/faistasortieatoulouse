'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert, MapPin, Info, Loader2, Calendar, Clock, ExternalLink, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-script-loader';

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
}

interface MapClientProps {
  initialEvents: DiscordEvent[];
}

const TOULOUSE_CENTER = { lat: 43.6047, lng: 1.4442 };
const GUILD_ID = '1422806103267344416';

export default function MapClient({ initialEvents }: MapClientProps) {
  const [mappedEvents, setMappedEvents] = useState<MappedEvent[]>([]);
  const [geocodingStatus, setGeocodingStatus] = useState<'pending' | 'loading' | 'complete' | 'error'>('pending');

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_CLIENT_KEY;

  // Hook pour charger Google Maps JS API
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapsError, setMapsError] = useState(false);

  useEffect(() => {
    if (!apiKey || document.getElementById(GOOGLE_MAPS_SCRIPT_ID)) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&language=fr`;
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.async = true;
    script.onload = () => setMapsLoaded(true);
    script.onerror = () => setMapsError(true);

    document.head.appendChild(script);
  }, [apiKey]);

  const addressEvents = useMemo(
    () => initialEvents.filter(e => e.entity_type === 3 && !!e.entity_metadata?.location?.trim()),
    [initialEvents]
  );

  // Géocodage via API serveur sécurisée
  const geocodeAll = useCallback(async () => {
    if (addressEvents.length === 0) {
      setGeocodingStatus('complete');
      return;
    }

    setGeocodingStatus('loading');
    const temp: MappedEvent[] = [];

    for (const event of addressEvents) {
      const location = event.entity_metadata?.location?.trim();
      if (!location) continue;

      try {
        const res = await fetch(`/api/geocoderoute?address=${encodeURIComponent(location)}`);
        const data = await res.json();

        if (data.status === 'OK' && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          temp.push({ ...event, position: { lat, lng }, isGeocoded: true });
        } else {
          console.warn(`Géocodage échoué pour "${event.name}" (${location}): ${data.status}`);
        }
      } catch (err) {
        console.error(`Erreur géocodage pour "${event.name}" (${location}):`, err);
      }
    }

    setMappedEvents(temp);
    setGeocodingStatus('complete');
  }, [addressEvents]);

  useEffect(() => {
    if (geocodingStatus === 'pending') geocodeAll();
  }, [geocodeAll, geocodingStatus]);

  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<google.maps.Map | null>(null);

  // Init / update Google Maps
  useEffect(() => {
    if (!mapsLoaded || geocodingStatus !== 'complete' || !mapRef.current) return;

    const map = mapInstanceRef.current ?? new window.google.maps.Map(mapRef.current, {
      center: TOULOUSE_CENTER,
      zoom: 12,
      gestureHandling: 'greedy',
    });

    // Ajout des markers
    mappedEvents.forEach(event => {
      new window.google.maps.Marker({
        position: event.position,
        map,
        title: event.name,
      });
    });

    // Ajuste bounds si events
    if (mappedEvents.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      mappedEvents.forEach(e => bounds.extend(e.position));
      map.fitBounds(bounds);
    }

    mapInstanceRef.current = map;
  }, [mapsLoaded, geocodingStatus, mappedEvents]);

  const handleRefresh = () => window.location.reload();

  const renderMapStatus = () => {
    if (!apiKey || mapsError || geocodingStatus === 'error') {
      return (
        <Alert variant="destructive" className="h-full flex flex-col justify-center items-center text-center p-6">
          <TriangleAlert className="h-8 w-8 mb-3" />
          <AlertTitle>Erreur de chargement ou géocodage</AlertTitle>
          <AlertDescription>Vérifiez vos clés Google Maps et votre API serveur.</AlertDescription>
          <Button onClick={handleRefresh}>Rafraîchir</Button>
        </Alert>
      );
    }

    if (geocodingStatus !== 'complete' || !mapsLoaded) {
      return (
        <div className="h-full flex flex-col justify-center items-center">
          <Loader2 className="h-10 w-10 animate-spin mb-4" />
          <p>Chargement de la carte et géocodage...</p>
        </div>
      );
    }

    if (mappedEvents.length === 0) {
      return (
        <Alert className="h-full flex flex-col justify-center items-center text-center p-6">
          <Info className="h-8 w-8 mb-3 text-blue-500" />
          <AlertTitle>Aucun événement localisable</AlertTitle>
          <AlertDescription>Aucun événement avec adresse physique n’a été trouvé.</AlertDescription>
        </Alert>
      );
    }

    return null;
  };

  const getLocationDetails = (event: DiscordEvent) => {
    if (event.entity_type === 3) {
      const location = event.entity_metadata?.location?.trim();
      return {
        icon: <MapPin className="h-4 w-4 text-green-600" />,
        text: location || 'Lieu externe non spécifié',
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
        <CardContent className="p-0">
          <div className="aspect-video w-full min-h-[500px]">
            {renderMapStatus() ?? <div ref={mapRef} style={{ width: '100%', height: '100%' }} />}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Liste des événements à venir</CardTitle>
          <CardDescription>Y compris ceux sans localisation mappable.</CardDescription>
        </CardHeader>
        <CardContent className="max-h-[400px] overflow-y-auto space-y-4 p-4">
          {initialEvents.map(event => {
            const details = getLocationDetails(event);
            return (
              <div key={event.id} className="rounded-lg border bg-card p-4 shadow-sm hover:shadow-md">
                <h3 className="mb-2 font-semibold text-primary">{event.name}</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Calendar className="mt-0.5 h-4 w-4" />
                    <span>{format(new Date(event.scheduled_start_time), 'EEEE d MMMM yyyy', { locale: fr })}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-4 w-4" />
                    <span>{format(new Date(event.scheduled_start_time), "HH'h'mm", { locale: fr })}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    {details.icon}
                    <a
                      href={details.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={details.isMappable ? 'text-blue-600 hover:text-blue-800 underline' : 'text-foreground font-medium'}
                    >
                      {details.text}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
