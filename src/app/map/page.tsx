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
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function MapPage() {
  const eventsData = await fetchEventsData();
  
  // 1. Tri des événements par date de début (du plus proche au plus éloigné)
  const sortedEvents = eventsData.sort((a, b) => 
    new Date(a.scheduled_start_time).getTime() - new Date(b.scheduled_start_time).getTime()
  );

  // 2. Limitation du tableau aux 20 premiers événements
  const limitedEvents = sortedEvents.slice(0, 20);

  return <MapClient initialEvents={limitedEvents} />;
}
