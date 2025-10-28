'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import L, { LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import MarkerClusterGroup from 'react-leaflet-cluster';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });
const Tooltip = dynamic(() => import('react-leaflet').then(m => m.Tooltip), { ssr: false });

const isMobile = typeof window !== 'undefined' && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

interface Event {
  id: string;
  name: string;
  location: string;
  date?: string;
  time?: string;
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
          const { lat, lng } = data.results[0].geometry.location;
          return { lat, lng };
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

    if (events.length > 0) {
      geocodeAll();
    }
  }, [events]);

  if (events.length === 0) return <p>Aucun événement à afficher.</p>;
  if (eventsWithCoords.length === 0) return <p>Chargement des événements…</p>;

  const center = [eventsWithCoords[0].latitude, eventsWithCoords[0].longitude] as [number, number];

  const handleMarkerClick = (e: LeafletMouseEvent) => {
    e.target.closeTooltip();
    e.target.openPopup();
  };

  return (
    <MapContainer center={center} zoom={12} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MarkerClusterGroup chunkedLoading>
        {eventsWithCoords.map((ev) => (
          <Marker
            key={ev.id}
            position={[ev.latitude, ev.longitude]}
            eventHandlers={{ click: handleMarkerClick }}
          >
            {/* ✅ Popup visible au clic */}
            <Popup>
              <strong>{ev.name}</strong>
              <br />
              {ev.location}
              {ev.date && (
                <>
                  <br />
                  📅 {ev.date}
                </>
              )}
              {ev.time && (
                <>
                  <br />
                  🕒 {ev.time}
                </>
              )}
            </Popup>

            {/* ✅ Tooltip visible uniquement sur ordinateur */}
            {!isMobile && (
              <Tooltip sticky direction="top">
                {ev.name}
              </Tooltip>
            )}
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
