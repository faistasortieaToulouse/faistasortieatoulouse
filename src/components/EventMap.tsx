import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- Types et Interfaces ---
interface Event {
  id: string;
  name: string;
  location: string;
}

interface EventWithCoords extends Event {
  latitude: number;
  longitude: number;
}

interface EventMapProps {
  events: Event[];
}

// --- Mock Geocoder (Pour une application autonome) ---
// Simule le géocodage en générant des coordonnées basées sur le hachage de l'adresse.
// Cela garantit que la carte fonctionne sans clé API externe.
function mockGeocode(address: string): { lat: number; lng: number } {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    const char = address.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }

  // Base des coordonnées (Paris, France)
  const baseLat = 48.8566;
  const baseLng = 2.3522;

  // Utiliser le hash pour créer un offset entre -0.1 et +0.1 degrés.
  const latOffset = ((hash % 2000) / 10000) - 0.1;
  const lngOffset = (((hash * 7) % 2000) / 10000) - 0.1;

  return {
    lat: baseLat + latOffset,
    lng: baseLng + lngOffset,
  };
}

// --- Solution autonome pour l'icône Leaflet ---
// Évite les erreurs 404 en utilisant une icône de marqueur simplifiée en SVG/Base64
const defaultIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0iI2RiMmI0YyI+PHBhdGggZD0iTTE2IDBDOS4wMzIgMCAzLjUgNS41MzIgMy41IDEyLjVMNC43NTIgMjYuNDc2TDE2IDMyTDI3LjI0OCAyNi40NzZMMjguNSA5LjY3MkMxOC41NTIgOS42NzIgMTYgMTcuMzMyIDE2IDBjIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48Y2lyY2xlIGN4PSIxNiIgY3k9IjEyLjUiIHI9IjUiIGZpbGw9IiNmZmYiLz48L3N2Zz4=',
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [0, -42],
});

L.Marker.prototype.options.icon = defaultIcon;

// --- Composant pour ajuster la vue de la carte après le chargement des marqueurs ---
const MapViewUpdater: React.FC<{ events: EventWithCoords[] }> = ({ events }) => {
  const map = useMap();

  useEffect(() => {
    if (events.length > 0) {
      // Calculer les limites (bounds) pour englober tous les marqueurs
      const bounds = L.latLngBounds(events.map(e => [e.latitude, e.longitude] as L.LatLngTuple));

      // Adapter la vue de la carte pour inclure toutes les limites
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [events, map]);

  return null;
};


// --- Composant principal EventMap ---
const EventMap: React.FC<EventMapProps> = ({ events }) => {
  const [eventsWithCoords, setEventsWithCoords] = useState<EventWithCoords[]>([]);
  const [loading, setLoading] = useState(true);

  // Utilisation de useMemo pour mémoriser le centre initial basé sur les données
  const initialCenter: [number, number] = useMemo(() => {
    if (eventsWithCoords.length > 0) {
      return [eventsWithCoords[0].latitude, eventsWithCoords[0].longitude];
    }
    // Centre de secours (Paris)
    return [48.8566, 2.3522];
  }, [eventsWithCoords]);


  useEffect(() => {
    setLoading(true);
    async function geocodeAll() {
      // Simule l'appel asynchrone pour la transition de chargement
      await new Promise(resolve => setTimeout(resolve, 500)); 

      const mapped = events.map((event) => {
        const coords = mockGeocode(event.location);
        return { ...event, latitude: coords.lat, longitude: coords.lng };
      });

      setEventsWithCoords(mapped);
      setLoading(false);
    }

    geocodeAll();
  }, [events]);

  return (
    <div className="bg-gray-50 p-4 rounded-xl shadow-2xl transition-all duration-300">
      <h2 className="text-2xl font-bold mb-4 text-indigo-700">Carte des Événements</h2>
      
      {events.length === 0 ? (
        <p className="text-gray-600 p-4 bg-white rounded-lg border border-gray-200">
          Aucun événement à afficher sur la carte.
        </p>
      ) : loading ? (
        <div className="flex items-center justify-center h-96 bg-gray-200 rounded-lg">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-indigo-600">Chargement et géocodage simulé des {events.length} événements...</p>
        </div>
      ) : (
        <div className="h-96 w-full rounded-lg overflow-hidden border-4 border-indigo-500 shadow-xl">
          <MapContainer 
            center={initialCenter} 
            zoom={13} 
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapViewUpdater events={eventsWithCoords} />

            {eventsWithCoords.map((event) => (
              <Marker 
                key={event.id} 
                position={[event.latitude, event.longitude]}
                icon={defaultIcon}
              >
                <Popup className="font-sans">
                  <div className="p-1">
                    <strong className="text-indigo-600 text-lg">{event.name}</strong>
                    <br />
                    <span className="text-sm text-gray-700">{event.location}</span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
};


// --- Données d'Exemple ---
const mockEvents: Event[] = [
  { id: 'e1', name: 'Conférence TechDay', location: '1 Rue de la Paix, Paris, France' },
  { id: 'e2', name: 'Atelier Cuisine Végétale', location: '8 Avenue des Champs-Élysées, Paris, France' },
  { id: 'e3', name: 'Concert Jazz', location: '15 Place de la Bastille, Paris, France' },
  { id: 'e4', name: 'Exposition Art Moderne', location: '42 Boulevard Saint-Germain, Paris, France' },
  { id: 'e5', name: 'Hackathon Futur', location: '100 Rue de Rivoli, Paris, France' },
];

// --- Composant Principal de l'Application ---
export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center items-center font-sans">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
            Application de Cartographie d'Événements
        </h1>
        <EventMap events={mockEvents} />
      </div>
    </div>
  );
}
