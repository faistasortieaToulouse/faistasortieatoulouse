'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix icône par défaut Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

// Type événement
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
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
        );
        const data = await res.json();
        if (data.status === 'OK' && data.results.length > 0) {
          return data.results[0].geometry.location; // { lat, lng }
        }
        console.warn('Géocodage échoué pour :', address);
        return null;
      } catch (err) {
        console.error('Erreur géocodage :', err);
        return null;
      }
    }

    async function geocodeAll() {
      const mapped = await Promise.all(
        events.map(async (event) => {
          const coords = await geocodeAddress(event.location);
          if (!coords) return null;
          return { ...event, latitude: coords.lat, longitude: coords.lng };
        })
      );

      setEventsWithCoords(mapped.filter(Boolean) as EventWithCoords[]);
    }

    geocodeAll();
  }, [events]);

  if (events.length === 0) return <p>Aucun événement à afficher sur la carte.</p>;
  if (eventsWithCoords.length === 0) return <p>Chargement et géocodage des événements...</p>;

  // Centre la carte sur le premier événement
  const center = [eventsWithCoords[0].latitude, eventsWithCoords[0].longitude] as [number, number];

  return (
    <MapContainer center={center} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {eventsWithCoords.map((event) => (
        <Marker key={event.id} position={[event.latitude, event.longitude]}>
          <Popup>
            <strong>{event.name}</strong>
            <br />
            {event.location}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
