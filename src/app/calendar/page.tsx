import CalendarClient from './page-client';

// Garder la construction dynamique
export const dynamic = 'force-dynamic'; 
// ✅ CORRECTION : Réintroduction d'une revalidation de 5 minutes (300s) pour éviter le rate-limiting 429.
export const revalidate = 300; 

// Interface complète pour les événements Discord (pour la robustesse du typage)
interface DiscordEvent {
  id: string;
  name: string;
  scheduled_start_time: string;
  description?: string;
  channel_id: string | null;
  entity_type: 1 | 2 | 3;
  entity_metadata: {
    location?: string;
  } | null;
}

const GUILD_ID = '1422806103267344416';

// --- Fetch des événements Discord (Version avec cache contrôlé) ---
async function fetchEventsData(): Promise<DiscordEvent[]> {
  const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
  if (!DISCORD_TOKEN) {
    console.warn("DISCORD_BOT_TOKEN est manquant.");
    return [];
  }

  try {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${GUILD_ID}/scheduled-events`,
      { 
        headers: { Authorization: `Bot ${DISCORD_TOKEN}` }, 
        // ✅ CORRECTION : Utilisation de l'option 'next' pour la revalidation gérée par Next.js
        next: { revalidate: 300 },
        // L'option 'cache: no-store' est retirée pour laisser 'next' prendre le relais.
      }
    );
    
    if (!res.ok) {
      // Le statut 429 s'affichera ici. En cas de 429, on renvoie un tableau vide
      // pour que l'application ne plante pas et puisse se revalider plus tard.
      console.error(`Erreur Discord API: Échec du fetch avec statut ${res.status} (${res.statusText}). Le token est-il valide ?`);
      return [];
    }
    
    const events: DiscordEvent[] = await res.json();
    return events;
    
  } catch (err) {
    console.error("Erreur lors de la récupération des événements (Network Error):", err);
    return [];
  }
}

export default async function CalendarServerPage() {
  const eventsData = await fetchEventsData();
  
  const now = new Date();
  const upcomingEvents = eventsData
    .filter(event => new Date(event.scheduled_start_time) >= now)
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
