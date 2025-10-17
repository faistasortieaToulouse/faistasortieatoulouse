'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  TriangleAlert,
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

// --- Interfaces et Constantes (Inchangées) ---

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

// --- Composant Client ---

export default function MapClient({ initialEvents }: MapClientProps) {
  const [mappedEvents, setMappedEvents] = useState<MappedEvent[]>([]);
  const [geocodingStatus, setGeocodingStatus] = useState<'pending' | 'loading' | 'complete' | 'error'>('pending');
  const [mapsLoaded, setMapsLoaded] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const addressEvents = useMemo(
    () => initialEvents.filter(e => e.entity_type === 3 && !!e.entity_metadata?.location?.trim().length),
    [initialEvents]
  );

  // Fonction pour rafraîchir la page
  const handleRefresh = () => {
    window.location.reload();
  };
  
  // --- Géocodage via fetch ---
  useEffect(() => {
    // Cas où il n'y a pas de clé API ou pas d'adresse à géocoder
    if (!apiKey || addressEvents.length === 0) {
      setGeocodingStatus(addressEvents.length === 0 ? 'complete' : 'error');
      return;
    }

    const geocodeAll = async () => {
      setGeocodingStatus('loading');
      const temp: MappedEvent[] = [];
      let successCount = 0;

      for (const event of addressEvents) {
        const location = event.entity_metadata?.location?.trim();
        if (!location) continue;

        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`
          );
          const data = await res.json();

          if (data.status === 'OK' && data.results.length > 0) {
            const { lat, lng } = data.results[0].geometry.location;
            temp.push({ ...event, position: { lat, lng }, isGeocoded: true });
            successCount++;
          } else {
            console.warn(`⚠️ Géocodage échoué pour "${event.name}" ("${location}"):`, data.status, data.error_message);
          }
        } catch (err) {
          console.error(`❌ Erreur géocodage pour "${event.name}" ("${location}"):`, err);
        }
      }

      setMappedEvents(temp);
      console.log(`Géocodage terminé: ${successCount} / ${addressEvents.length} événements géocodés avec succès.`);
      setGeocodingStatus('complete');
    };

    geocodeAll();
  }, [apiKey, addressEvents]);
  
  // --- Messages de Statut pour la Carte (Nouveau) ---

  const renderMapStatus = () => {
    const isError = geocodingStatus === 'error' || !apiKey;
    const isLoading = geocodingStatus === 'loading' || geocodingStatus === 'pending' || !mapsLoaded;
    const noMappableEventsFound = mappedEvents.length === 0 && geocodingStatus === 'complete';

    if (isError) {
      return (
        <Alert variant="destructive" className="h-full flex flex-col justify-center items-center text-center p-6">
          <TriangleAlert className="h-8 w-8 mb-3" />
          <AlertTitle className="text-lg font-bold">Erreur de chargement ou de géocodage</AlertTitle>
          <AlertDescription className="mt-2 mb-4">
            Un problème est survenu lors du chargement des cartes ou de la conversion des adresses.
          </AlertDescription>
          <Button onClick={handleRefresh}>
            Rafraîchir la page
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            (Si l'erreur persiste, veuillez vérifier votre clé Google Maps.)
          </p>
        </Alert>
      );
    }

    if (isLoading) {
      return (
        <div className="h-full flex flex-col justify-center items-center bg-gray-50/50">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-lg font-semibold text-primary">Chargement de la carte et géocodage des adresses...</p>
          <p className="text-sm text-muted-foreground mt-2">
            Veuillez patienter, cette étape peut prendre quelques secondes si de nombreux événements doivent être localisés.
          </p>
        </div>
      );
    }
    
    if (noMappableEventsFound) {
        return (
            <Alert className="h-full flex flex-col justify-center items-center text-center p-6">
                <Info className="h-8 w-8 mb-3 text-blue-500" />
                <AlertTitle className="text-lg font-bold">Aucun événement avec localisation</AlertTitle>
                <AlertDescription className="mt-2">
                    Aucun événement à localiser (avec adresse physique) n'a été trouvé.
                </AlertDescription>
            </Alert>
        );
    }

    // Retourne null si tout est prêt pour afficher la carte
    return null; 
  };
  
  // --- Rendu de la Carte (Mis à jour) ---

  const renderMap = () => {
    // Si nous sommes en état d'erreur, de chargement, ou sans événement, affiche le statut
    const statusComponent = renderMapStatus();
    if (statusComponent) {
        return statusComponent;
    }
      
    // Si on arrive ici, le statut est 'complete' ET il y a des événements mappables
    return (
      <APIProvider apiKey={apiKey!} onLoad={() => setMapsLoaded(true)}>
        <Map
          defaultCenter={TOULOUSE_CENTER}
          defaultZoom={12}
          mapId="votre-map-id-ici" // REMPLACER par votre Map ID si vous en avez un
          gestureHandling={'greedy'}
        >
          {mappedEvents.map(event => (
            <Marker key={event.id} position={event.position} title={event.name} />
          ))}
        </Map>
      </APIProvider>
    );
  };
  
  // --- Helpers pour l'affichage de la liste (Inchangé) ---

  const getLocationDetails = (event: DiscordEvent) => {
    if (event.entity_type === 3) {
      const location = event.entity_metadata?.location?.trim();
      return {
        icon: <MapPin className="h-4 w-4 text-green-600" />,
        text: location || 'Lieu externe non spécifié',
        // Correction de l'erreur dans la construction du lien
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


  // --- Rendu Final (Mis à jour pour utiliser renderMap) ---

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardContent className="p-0">
          {/* C'est ici que renderMap() affiche soit la carte, soit le statut */}
          <div className="aspect-video w-full min-h-[500px]">{renderMap()}</div> 
        </CardContent>
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
