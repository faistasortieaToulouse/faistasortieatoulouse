import MapClient from './map-client';

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

const GUILD_ID = '1422806103267344416';

// --- Logique serveur ---
async function fetchEventsData(): Promise<DiscordEvent[]> {
  const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
  if (!DISCORD_TOKEN) {
    console.warn("DISCORD_BOT_TOKEN est manquant. Les événements ne seront pas chargés.");
    return [];
  }

  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/scheduled-events`, {
      headers: { Authorization: `Bot ${DISCORD_TOKEN}` },
      next: { revalidate: 300 }, // ✅ OK ici car on est côté serveur
    });

    if (!res.ok) {
      console.error(`Erreur Discord API: ${res.status}`);
      return [];
    }

    return res.json();
  } catch (err) {
    console.error("Erreur lors de la récupération des événements:", err);
    return [];
  }
}

// --- Composant Serveur ---
export default async function MapPage() {
  const eventsData = await fetchEventsData();
  return <MapClient initialEvents={eventsData} />;
}
