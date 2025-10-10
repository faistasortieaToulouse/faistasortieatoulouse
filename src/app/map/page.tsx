'use client';

import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert } from 'lucide-react';
import { useState, useEffect } from 'react';

const toulousePosition = { lat: 43.6047, lng: 1.4442 };

const popularSpots = [
  { id: 1, name: "Place du Capitole", position: { lat: 43.6044, lng: 1.4431 } },
  { id: 2, name: "Cité de l'Espace", position: { lat: 43.587, lng: 1.4925 } },
  { id: 3, name: "Basilique Saint-Sernin", position: { lat: 43.6083, lng: 1.4422 } },
  { id: 4, name: "Jardin des Plantes", position: { lat: 43.5936, lng: 1.4504 } },
];

export default function MapPage() {
  const [apiKey, setApiKey] = useState<string | undefined>(undefined);

  useEffect(() => {
    setApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  console.log("Clé Google Maps :", process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  setApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  }, []);

  return (
    <div className="p-4 md:p-8">
      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold text-primary">Carte Interactive</h1>
        <p className="mt-2 text-muted-foreground">
          Lieux d'événements et points d'intérêt à Toulouse.
        </p>
      </header>
      
      {!apiKey && (
        <Alert variant="destructive" className="mb-4">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Configuration requise</AlertTitle>
          <AlertDescription>
            Une clé API Google Maps est nécessaire pour afficher la carte. Veuillez vérifier que <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> est bien définie.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="aspect-video w-full">
            {apiKey ? (
              <APIProvider apiKey={apiKey}>
                <Map
                  defaultCenter={toulousePosition}
                  defaultZoom={13}
                  mapId="toulouse-map"
                  gestureHandling={'greedy'}
                  disableDefaultUI={true}
                >
                  {popularSpots.map((spot) => (
                    <Marker key={spot.id} position={spot.position} title={spot.name} />
                  ))}
                </Map>
              </APIProvider>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <p className="text-muted-foreground">La carte ne peut pas être chargée.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
