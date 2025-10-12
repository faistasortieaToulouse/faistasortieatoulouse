// /src/app/calendar/page.tsx
import CalendarClient from './page-client';

// FORCE LE RENDU DYNAMIQUE CÔTÉ SERVEUR (SSR)
export const dynamic = 'force-dynamic'; 
export const revalidate = 300; // Rafraîchissement toutes les 5 minutes

// Types nécessaires
interface DiscordEvent {
  id: string;
  name: string;
  scheduled_start_time: string;
  description?: string;
}

const GUILD_ID = '1422806103267344416'; 

// --- Fetch des événements Discord avec timeout ---
async function fetchEventsData(): Promise<DiscordEvent[]> {
  const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
  if (!DISCORD_TOKEN) {
    console.warn("DISCORD_BOT_TOKEN manquant. Les événements ne seront pas chargés.");
    return [];
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/scheduled-events`, {
      headers: { Authorization: `Bot ${DISCORD_TOKEN}` },
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error(`Erreur récupération événements Discord: ${res.status} ${res.statusText}`);
      return [];
    }

    return res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if ((err as Error).name === 'AbortError') {
      console.error('Timeout de 10s pour la récupération des événements Discord.');
    } else {
      console.error('Erreur réseau/parsing pour les événements Discord:', err);
    }
    return [];
  }
}

// --- Page serveur ---
export default async function CalendarServerPage() {
  const eventsData = await fetchEventsData();

  // Filtrage et tri des événements à venir
  const upcomingEvents = eventsData
    .filter(event => new Date(event.scheduled_start_time) > new Date())
    .sort((a, b) => new Date(a.scheduled_start_time).getTime() - new Date(b.scheduled_start_time).getTime());

  // Transformation pour passer au Calendar (eventMap)
  const eventMap: Record<string, DiscordEvent[]> = {};
  eventsData.forEach(event => {
    const dateKey = new Date(event.scheduled_start_time).toDateString();
    if (!eventMap[dateKey]) eventMap[dateKey] = [];
    eventMap[dateKey].push({
      id: event.id,
      name: event.name,
      scheduled_start_time: event.scheduled_start_time,
      description: event.description,
    });
  });

  return (
    <section className="border rounded-lg shadow-sm p-4 bg-card text-card-foreground">
      <h2 className="text-xl font-bold mb-3 text-primary">Calendrier des Événements Discord</h2>
      {/* Composant client qui va afficher le calendrier avec eventMap */}
      <CalendarClient eventMap={eventMap} upcomingEvents={upcomingEvents} />
    </section>
  );
}
