'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
// ⚠️ Import du composant React-Leaflet pour les clusters
import MarkerClusterGroup from 'react-leaflet-cluster'; 

// 🧩 Import dynamique de react-leaflet (évite le bug SSR "window is not defined")
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });
// Le composant Tooltip n'est pas nécessaire ici si l'on veut le titre au clic/tap (via Popup)
// const Tooltip = dynamic(() => import('react-leaflet').then(m => m.Tooltip), { ssr: false }); 

// 🛠️ Fix icônes Leaflet (corrige ton erreur TypeScript)
delete (L.Icon.Default.prototype as any)._getIconUrl;
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

  // 📝 Logique de Géocodage inchangée
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

  return (
    <MapContainer center={center} zoom={12} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* 🟢 Ajout du MarkerClusterGroup pour regrouper les marqueurs et améliorer l'interaction mobile */}
      {/* Sur mobile, le clic sur un marqueur affichera le Popup. */}
      {/* Sur desktop, le Popup s'affiche au clic, mais si vous utilisiez Tooltip, celui-ci s'afficherait au survol. */}
      <MarkerClusterGroup chunkedLoading>
        {eventsWithCoords.map((ev) => (
          <Marker 
            key={ev.id} 
            position={[ev.latitude, ev.longitude]}
            // 💡 Pour le débogage : Ajouter une option pour rendre le marqueur cliquable
            // bien que ce soit le défaut si un Popup est présent.
            // eventHandlers={{
            //   click: (e) => {
            //     e.target.openPopup();
            //   },
            // }}
          >
            {/* Le Popup est l'élément qui s'ouvre au clic/tap (y compris sur mobile) */}
            <Popup>
              <strong>{ev.name}</strong>
              <br />
              {ev.location}
            </Popup>

            {/* Si vous voulez VRAIMENT le titre au survol sur desktop ET rien de plus sur mobile 
                (le premier tap ouvre le Popup), vous pouvez ajouter un Tooltip :
            <Tooltip>{ev.name}</Tooltip> 
            */}

          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
