'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert, MapPin, Info, Loader2, Calendar, Clock, ExternalLink, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types
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

// --- Hook pour charger Google Maps ---
const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-script-loader';
const useGoogleMapsLoader = (apiKey: string | undefined) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!apiKey || document.getElementById(GOOGLE_MAPS_SCRIPT_ID)) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&language=fr`;
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.onload = () => setLoaded(true);
    script.onerror = () => setError(true);
    document.head.appendChild(script);
  }, [apiKey]);

  return { loaded, error };
};

export default function MapClient({ initialEvents }: MapClientProps) {
  const [mappedEvents, setMappedEvents] = useState<MappedEvent[]>([]);
  const [geocodingStatus, setGeocodingStatus] = useState<'pending' | 'loading' | 'complete' | 'error'>('pending');

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_CLIENT_KEY;

  const { loaded: mapsLoaded, error: mapsError } = useGoogleMapsLoader(apiKey);

  const addressEvents = useMemo(
    () => initialEvents.filter(e => e.entity_type === 3 && !!e.entity_metadata?.location?.trim().length),
    [initialEvents]
  );

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  // --- Géocodage côté serveur via API ---
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
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { status: 'ERROR', results: [] }; }

      if (data.status === 'OK' && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        temp.push({ ...event, position: { lat, lng }, isGeocoded: true });
      } else {
        console.warn(`Adresse introuvable: "${location}"`);
      }
    } catch (err) {
      console.error(`Erreur géocodage pour "${location}"`, err);
    }
  }

  setMappedEvents(temp);
  setGeocodingStatus('complete');
}, [addressEvents]);


  useEffect(() => {
    if (geocodingStatus === 'pending') geocodeAll();
  }, [geocodeAll, geocodingStatus]);

  // --- Initialisation / mise à jour de la carte ---
  useEffect(() => {
    if (!mapsLoaded || geocodingStatus !== 'complete' || !mapRef.current) return;

    if (!mapInstanceRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: TOULOUSE_CENTER,
        zoom: 12,
        gestureHandling: 'greedy',
      });
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    map.clearMarkers?.(); // pour éviter doublons si tu implémentes clearMarkers

    if (mappedEvents.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      mappedEvents.forEach(ev => {
        const pos = new window.google.maps.LatLng(ev.position.lat, ev.position.lng);
        bounds.extend(pos);
        new window.google.maps.Marker({
          position: pos,
          map,
          title: ev.name,
        });
      });
      map.fitBounds(bounds);
    } else {
      map.setCenter(TOULOUSE_CENTER);
      map.setZoom(12);
    }
  }, [mapsLoaded, geocodingStatus, mappedEvents]);

  const handleRefresh = useCallback(() => window.location.reload(), []);

  const renderMapStatus = () => {
    if (!apiKey || mapsError || geocodingStatus === 'error') {
      return (
        <Alert variant="destructive" className="h-full flex flex-col justify-center items-center text-center p-6">
          <TriangleAlert className="h-8 w-8 mb-3" />
          <AlertTitle>Erreur de chargement ou de géocodage</AlertTitle>
          <AlertDescription>Vérifie la clé Google Maps et la disponibilité de l'API.</AlertDescription>
          <Button onClick={handleRefresh}>Rafraîchir</Button>
        </Alert>
      );
    }
    if (geocodingStatus !== 'complete' || !mapsLoaded) {
      return (
        <div className="h-full flex flex-col justify-center items-center">
          <Loader2 className="h-10 w-10 animate-spin mb-4" />
          Chargement de la carte et géocodage…
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

  const renderMap = () => {
    const status = renderMapStatus();
    if (status) return status;
    return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
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
        <CardContent className="p-0">{renderMap()}</CardContent>
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
