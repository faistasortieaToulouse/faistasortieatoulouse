'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  TriangleAlert,
  PartyPopper,
  MapPin,
  Info,
  Loader2,
  Calendar,
  Clock,
  ExternalLink,
  Mic
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

interface DiscordEvent {
  id: string;
  name: string;
  scheduled_start_time: string;
  channel_id: string | null;
  entity_type: 1 | 2 | 3;
  entity_metadata: {
    location?: string;
  } | null;
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

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const addressEvents = useMemo(
    () => initialEvents.filter(e => e.entity_type === 3 && !!e.entity_metadata?.location?.trim().length),
    [initialEvents]
  );

  // --- Géocodage ---
  useEffect(() => {
    if (!apiKey || addressEvents.length === 0) return;

    const interval = setInterval(() => {
      if (window.google?.maps?.Geocoder) {
        clearInterval(interval);
        setGeocodingStatus('loading');

        const geocoder = new window.google.maps.Geocoder();
        const temp: MappedEvent[] = [];
        let done = 0;

        addressEvents.forEach(event => {
          const location = event.entity_metadata?.location;
          if (!location) {
            done++;
            return;
          }

          geocoder.geocode({ address: location }, (results, status) => {
            done++;
            if (status === 'OK' && results && results[0]) {
              const lat = results[0].geometry.location.lat();
              const lng = results[0].geometry.location.lng();
              temp.push({ ...event, position: { lat, lng }, isGeocoded: true });
            } else {
              temp.push({ ...event, position: { lat: 0, lng: 0 }, isGeocoded: false });
              console.warn(`⚠️ Géocodage échoué pour "${event.name}" (${status})`);
            }

            if (done === addressEvents.length) {
              setMappedEvents(temp.filter(e => e.isGeocoded));
              setGeocodingStatus('complete');
            }
          });
        });
      }
    }, 500);

    return () => clearInterval(interval);
  }, [apiKey, addressEvents]);

  // --- Détails d’un événement ---
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
        isMappable: !!location
      };
    }

    const type = event.entity_type === 2 ? 'Salon Vocal' : 'Salon Stage';
    return {
      icon: <Mic className="h-4 w-4 text-indigo-500" />,
      text: type,
      link: `https://discord.com/events/${GUILD_ID}/${event.id}`,
      isMappable: false
    };
  };

  // --- Carte ---
  const renderMap = () => (
    <APIProvider apiKey={apiKey!}>
      <Map
        defaultCenter={mappedEvents.length > 0 ? mappedEvents[0].position : TOULOUSE_CENTER}
        defaultZoom={13}
        mapId="toulouse-map"
        gestureHandling="greedy"
        disableDefaultUI
        className="w-full h-full"
      >
        {mappedEvents.map(event => (
          <Marker
            key={event.id}
            position={event.position}
            title={`${event.name} - ${event.entity_metadata?.location}`}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#EF4444',
              fillOpacity: 0.9,
              strokeWeight: 0
            }}
          />
        ))}
      </Map>
    </APIProvider>
  );

  const renderMapStatus = () => {
    if (!apiKey)
      return (
        <div className="flex h-full items-center justify-center bg-muted/50">
          ❌ Clé API Google Maps manquante.
        </div>
      );
    if (addressEvents.length === 0)
      return (
        <div className="flex h-full items-center justify-center bg-muted/50">
          <Info className="h-5 w-5 mr-2 text-yellow-500" />
          Aucun événement externe à afficher.
        </div>
      );
    if (geocodingStatus === 'pending' || geocodingStatus === 'loading')
      return (
        <div className="flex h-full items-center justify-center bg-muted/50">
          <Loader2 className="animate-spin h-5 w-5 text-primary mr-2" />
          Chargement et géocodage de {addressEvents.length} événement(s)...
        </div>
      );
    if (geocodingStatus === 'complete' && mappedEvents.length === 0)
      return (
        <div className="flex h-full items-center justify-center bg-muted/50">
          <TriangleAlert className="h-5 w-5 text-red-500 mr-2" />
          Tous les géocodages ont échoué.
        </div>
      );
    if (geocodingStatus === 'error')
      return (
        <div className="flex h-full items-center justify-center bg-muted/50">
          <TriangleAlert className="h-5 w-5 text-red-500 mr-2" />
          Erreur de chargement de Google Maps.
        </div>
      );

    return renderMap();
  };

  // --- Rendu principal ---
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <header>
        <h1 className="text-4xl font-bold text-primary">Carte Interactive</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Localisation des événements externes "Fais Ta Sortie à Toulouse".
        </p>
      </header>

      <Alert className="mb-4">
        <PartyPopper className="h-4 w-4" />
        <AlertTitle>Statut du géocodage</AlertTitle>
        <AlertDescription>
          {geocodingStatus === 'pending' && 'En attente du chargement de la carte...'}
          {geocodingStatus === 'loading' && `Géocodage de ${addressEvents.length} événement(s)...`}
          {geocodingStatus === 'complete' &&
            `${mappedEvents.length} événement(s) géocodé(s) avec succès sur ${addressEvents.length}.`}
        </AlertDescription>
      </Alert>

      {/* Carte */}
      <Card>
        <CardContent className="p-0">
          <div className="aspect-video w-full min-h-[500px]">{renderMapStatus()}</div>
        </CardContent>
      </Card>

      {/* Liste des événements sous la carte */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Liste des événements à venir</CardTitle>
          <CardDescription>Y compris ceux sans localisation mappable.</CardDescription>
        </CardHeader>
        <CardContent className="max-h-[400px] overflow-y-auto space-y-4 p-4">
          {initialEvents.length === 0 ? (
            <p className="text-muted-foreground">Aucun événement trouvé.</p>
          ) : (
            initialEvents.map(event => {
              const details = getLocationDetails(event);
              return (
                <div
                  key={event.id}
                  className="rounded-lg border bg-card p-4 shadow-sm transition hover:shadow-md"
                >
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
                        className={
                          details.isMappable
                            ? 'text-blue-600 hover:text-blue-800 underline flex items-center'
                            : 'text-foreground font-medium flex items-center'
                        }
                      >
                        {details.text}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="mt-4 bg-primary hover:bg-primary/90 text-white border-primary"
                  >
                    <a
                      href={`https://discord.com/events/${GUILD_ID}/${event.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Voir sur Discord
                      <ExternalLink className="ml-2 h-4 w-4" />
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

