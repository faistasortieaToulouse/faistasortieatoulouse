'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
// Composants Shadcn/ui (assumés existants)
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// Icônes Lucide
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
// Date-fns pour le formatage des dates
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// --- Gestion du chargement de l'API Google Maps (Remplacement de @vis.gl/react-google-maps) ---
// Nous devons charger l'API via script et utiliser window.google.maps
// Pour contourner l'erreur de résolution de module, nous allons utiliser une approche basée sur le script tag.

// Une Map Component factice est nécessaire pour le rendu, 
// car les vrais composants Map et Marker de @vis.gl ne peuvent pas être importés.

// Nous allons injecter le script Google Maps si l'API n'est pas encore chargée.

const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-script-loader';

interface GoogleMapsLoadState {
  loaded: boolean;
  error: boolean;
}

const useGoogleMapsLoader = (apiKey: string | undefined): GoogleMapsLoadState => {
  const [loadState, setLoadState] = useState<GoogleMapsLoadState>({ loaded: false, error: false });

  useEffect(() => {
    if (loadState.loaded || loadState.error || !apiKey || document.getElementById(GOOGLE_MAPS_SCRIPT_ID)) {
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&language=fr`;
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.async = true;
    script.onerror = () => setLoadState({ loaded: false, error: true });
    script.onload = () => setLoadState({ loaded: true, error: false });

    document.head.appendChild(script);

    return () => {
      // Nettoyage optionnel si le composant est démonté
      // document.head.removeChild(script); 
    };
  }, [apiKey, loadState.loaded, loadState.error]);

  return loadState;
};

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

// --- Composant Principal de la Carte ---

export default function MapClient({ initialEvents }: MapClientProps) {
  const [mappedEvents, setMappedEvents] = useState<MappedEvent[]>([]);
  const [geocodingStatus, setGeocodingStatus] = useState<'pending' | 'loading' | 'complete' | 'error'>('pending');

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Utilisation du Hook pour charger l'API
  const { loaded: mapsLoaded, error: mapsError } = useGoogleMapsLoader(apiKey);

  const addressEvents = useMemo(
    () => initialEvents.filter(e => e.entity_type === 3 && !!e.entity_metadata?.location?.trim().length),
    [initialEvents]
  );

  // Fonction pour rafraîchir la page
  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);
  
  // --- Logique de Géocodage (définie avec useCallback pour la stabilité) ---
  // Nécessite que l'API soit chargée (mapsLoaded) pour utiliser window.google.maps.Geocoder
  const geocodeAll = useCallback(async () => {
    // Cas où il n'y a pas de clé API ou pas d'adresse à géocoder
    if (!apiKey || addressEvents.length === 0) {
      setGeocodingStatus(addressEvents.length === 0 ? 'complete' : 'error');
      return;
    }

    setGeocodingStatus('loading');
    const temp: MappedEvent[] = [];
    let successCount = 0;

    for (const event of addressEvents) {
      const location = event.entity_metadata?.location?.trim();
      if (!location) continue;

      try {
        // Changement : Utilisation de l'API de géocodage REST de Google (stable)
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
  }, [apiKey, addressEvents]); 
  
  // --- Exécution du Géocodage (déclenchée une seule fois APRÈS le chargement de l'API si nécessaire) ---
  useEffect(() => {
    // Exécuter le géocodage si le statut est 'pending' (initial)
    // Le géocodage n'a pas besoin d'attendre mapsLoaded car il utilise l'API REST
    if (geocodingStatus === 'pending') {
        geocodeAll();
    }
  }, [geocodeAll, geocodingStatus]); 

  // --- Rendu du Conteneur Map (Nouveau : Remplacement des composants Map et Marker) ---
  // Nous ne pouvons pas utiliser Map/Marker de @vis.gl, nous utilisons donc l'approche standard JS/DOM.
  
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<google.maps.Map | null>(null);

  // Initialisation de la carte une fois que le géocodage est terminé et l'API Maps chargée
  useEffect(() => {
    if (geocodingStatus === 'complete' && mapsLoaded && mapRef.current) {
        // Vérifie si la carte est déjà initialisée
        if (mapInstanceRef.current) {
            // Si elle existe, met à jour simplement les marqueurs et le centre
            updateMap(mapInstanceRef.current, mappedEvents);
            return;
        }

        // Initialisation de la carte
        const initialMap = new window.google.maps.Map(mapRef.current, {
            center: TOULOUSE_CENTER,
            zoom: 12,
            gestureHandling: 'greedy',
            mapId: 'votre-map-id-ici' // Remplacer si vous avez un ID de carte
        });

        mapInstanceRef.current = initialMap;
        updateMap(initialMap, mappedEvents);
    }
    
    // Nettoyage (si besoin, mais généralement non nécessaire pour Google Maps)
    return () => {
        if (mapInstanceRef.current) {
            // On pourrait appeler mapInstanceRef.current.setMap(null);
            mapInstanceRef.current = null;
        }
    };
  }, [geocodingStatus, mapsLoaded, mappedEvents]); // Dépendances importantes

  // Fonction pour mettre à jour la carte et les marqueurs
  const updateMap = (mapInstance: google.maps.Map, events: MappedEvent[]) => {
      // Efface les anciens marqueurs si nécessaire
      // (Nous allons les gérer dans l'objet Map pour la simplicité)

      // Supprime tous les anciens marqueurs
      // NOTE: Dans une implémentation complète, il faudrait garder la trace des objets Marker

      // Calcule le centre et le zoom si des marqueurs existent
      if (events.length > 0) {
          const bounds = new window.google.maps.LatLngBounds();
          events.forEach(event => {
              const position = new window.google.maps.LatLng(event.position.lat, event.position.lng);
              bounds.extend(position);
              
              // Crée et ajoute un nouveau marqueur
              new window.google.maps.Marker({
                  position: position,
                  map: mapInstance,
                  title: event.name,
              });
          });

          // Ajuste la vue pour contenir tous les marqueurs
          mapInstance.fitBounds(bounds);
          
      } else {
        // Pas d'événements, centre sur la ville par défaut
        mapInstance.setCenter(TOULOUSE_CENTER);
        mapInstance.setZoom(12);
      }
  };


  // --- Messages de Statut pour la Carte ---

  const renderMapStatus = () => {
    // mapsError est inclus ici pour capter l'erreur de chargement du script
    const isMapError = geocodingStatus === 'error' || !apiKey || mapsError;
    // On charge tant que le géocodage n'est pas terminé ou que le script Maps n'est pas chargé
    const isMapLoading = (geocodingStatus !== 'complete' && geocodingStatus !== 'error') || !mapsLoaded;
    const noMappableEventsFound = mappedEvents.length === 0 && geocodingStatus === 'complete';

    if (isMapError) {
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
            (Veuillez vérifier que la clé Google Maps est définie et valide.)
          </p>
        </Alert>
      );
    }

    if (isMapLoading) {
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
  
  // --- Rendu de la Carte (Mis à jour pour utiliser la référence DOM) ---

  const renderMap = () => {
    const statusComponent = renderMapStatus();
    if (statusComponent) {
        return statusComponent;
    }
      
    // Si le statut est 'complete' et mapsLoaded est vrai, on affiche le conteneur de la carte.
    // L'initialisation de la carte (GoogleMaps) se fera via useEffect sur ce conteneur.
    return (
      <div 
        ref={mapRef} 
        style={{ width: '100%', height: '100%' }}
        // NOTE: La carte sera injectée ici par Google Maps API
      >
      </div>
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


  // --- Rendu Final ---

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
