import MapClient from './map-client';

interface DiscordEvent {
  id: string;
  name: string;
  scheduled_start_time: string;
  channel_id: string | null;
  entity_type: 1 | 2 | 3;
  entity_metadata: { location?: string } | null;
}

const GUILD_ID = '1422806103267344416';

async function fetchEventsData(): Promise<DiscordEvent[]> {
  const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
  if (!DISCORD_TOKEN) return [];

  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/scheduled-events`, {
      headers: { Authorization: `Bot ${DISCORD_TOKEN}` },
      // Revalidation pour rafraîchir les événements toutes les 5 minutes
      next: { revalidate: 300 }, 
    });
    if (!res.ok) {
      console.error(`Failed to fetch events: ${res.status} ${res.statusText}`);
      return [];
    }
    return res.json();
  } catch (e) {
    console.error("Error during Discord API fetch:", e);
    return [];
  }
}

/**
 * Nettoie les données brutes de Discord pour assurer une sérialisation propre
 * et ne conserver que les champs nécessaires.
 */
function mapEvents(events: any[]): DiscordEvent[] {
    return events.map(event => ({
        id: event.id,
        name: event.name,
        scheduled_start_time: event.scheduled_start_time,
        channel_id: event.channel_id,
        entity_type: event.entity_type,
        entity_metadata: event.entity_metadata ? {
            location: event.entity_metadata.location
        } : null,
        // Ignorer le reste des champs Discord qui pourraient causer des problèmes de sérialisation
    }));
}

// Utilisation d'une fonction fléchée pour l'export par défaut (style Server Component standard)
export default async function MapPage() {
  const rawEventsData = await fetchEventsData();
  
  // 0. Nettoyage des données pour la sérialisation
  const cleanedEventsData = mapEvents(rawEventsData);

  // 1. Tri des événements par date de début (du plus proche au plus éloigné)
  // Créer une copie du tableau avant de trier pour éviter la mutation.
  const sortedEvents = [...cleanedEventsData].sort((a, b) => 
    new Date(a.scheduled_start_time).getTime() - new Date(b.scheduled_start_time).getTime()
  );

  // 2. Limitation du tableau aux 20 premiers événements
  const limitedEvents = sortedEvents.slice(0, 20);

  return <MapClient initialEvents={limitedEvents} />;
}
