import CalendarClient from './page-client';

export const dynamic = 'force-dynamic'; 
export const revalidate = 300;

interface DiscordEvent {
  id: string;
  name: string;
  scheduled_start_time: string;
  description?: string;
}

const GUILD_ID = '1422806103267344416';

// --- Fetch des événements Discord ---
async function fetchEventsData(): Promise<DiscordEvent[]> {
  const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
  if (!DISCORD_TOKEN) return [];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${GUILD_ID}/scheduled-events`,
      { headers: { Authorization: `Bot ${DISCORD_TOKEN}` }, signal: controller.signal, cache: 'no-store' }
    );
    clearTimeout(timeoutId);
    if (!res.ok) return [];
    return res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    return [];
  }
}

export default async function CalendarServerPage() {
  const eventsData = await fetchEventsData();

  // Tri des événements à venir
  const upcomingEvents = eventsData
    .filter(event => new Date(event.scheduled_start_time) > new Date())
    .sort((a, b) => new Date(a.scheduled_start_time).getTime() - new Date(b.scheduled_start_time).getTime());

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <section className="border rounded-lg shadow-sm p-4 bg-card text-card-foreground">
        <h2 className="text-xl font-bold mb-3 text-primary">Calendrier des Événements Discord</h2>
<CalendarClient eventsData={eventsData} upcomingEvents={upcomingEvents} />
      </section>
    </div>
  );
}
