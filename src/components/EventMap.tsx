'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

// Fix icône par défaut Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

// Types
interface Event {
  id: string;
  name: string;
  location: string;
}

interface EventMapProps {
  events: Event[];
}

interface EventWithCoords extends Event {
  latitude: number;
  longitude: number;
}

export default function EventMap({ events }: EventMapProps) {
  const [eventsWithCoords, setEventsWithCoords] = useState<EventWithCoords[]>([]);

  useEffect(() => {
    async function geocodeAddress(address: string) {
      try {
        const res = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
        const data = await res.json();
        if (data.status === 'OK' && data.results.length > 0) {
          return data.results[0]; // { lat, lng }
        }
        console.warn('Adresse introuvable :', address);
        return null;
      } catch (err) {
        console.error('Erreur géocodage :', err);
        return null;
      }
    }

    async function geocodeAll() {
      const mapped = await Promise.all(
        events.map(async (ev) => {
          const coords = await geocodeAddress(ev.location);
          if (!coords) return null;
          return { ...ev, latitude: coords.lat, longitude: coords.lng };
        })
      );

      setEventsWithCoords(mapped.filter(Boolean) as EventWithCoords[]);
    }

    geocodeAll();
  }, [events]);

  if (events.length === 0) return <p>Aucun événement à afficher.</p>;
  if (eventsWithCoords.length === 0) return <p>Chargement des événements…</p>;

  const center = [eventsWithCoords[0].latitude, eventsWithCoords[0].longitude] as [number, number];

  return (
    <MapContainer center={center} zoom={12} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Cluster */}
      {eventsWithCoords.length > 0 && (
        <MarkerClusterGroup>
          {eventsWithCoords.map((ev) => (
            <Marker key={ev.id} position={[ev.latitude, ev.longitude]}>
              <Popup>
                <strong>{ev.name}</strong>
                <br />
                {ev.location}
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      )}
    </MapContainer>
  );
}

// ⚠️ Note : MarkerClusterGroup n'est pas directement exporté par react-leaflet v4,
// il faut soit créer un composant wrapper, soit utiliser "react-leaflet-markercluster" si v3.
// Exemple wrapper minimal : 
function MarkerClusterGroup({ children }: { children: React.ReactNode }) {
  const [cluster, setCluster] = useState<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    const c = L.markerClusterGroup();
    setCluster(c);
    return () => {
      c.clearLayers();
    };
  }, []);

  if (!cluster) return null;

  return <>{children}</>; // les enfants doivent être ajoutés manuellement au cluster si nécessaire
}
