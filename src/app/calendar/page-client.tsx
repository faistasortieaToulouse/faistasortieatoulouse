import CalendarClient from './page-client';

export const revalidate = 300; // Rafraîchissement des données toutes les 5 minutes

// Définitions nécessaires pour le serveur
interface DiscordEvent {
    id: string;
    name: string;
    scheduled_start_time: string;
    description?: string;
}

const GUILD_ID = '1422806103267344416'; // Votre ID de Guilde

// Logique de Récupération des Événements
async function fetchEventsData(): Promise<DiscordEvent[]> {
    const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
    if (!DISCORD_TOKEN) {
        console.warn("DISCORD_BOT_TOKEN est manquant. Les événements ne seront pas chargés.");
        return [];
    }
    
    // Récupère les événements programmés
    return fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/scheduled-events`, {
        headers: { Authorization: `Bot ${DISCORD_TOKEN}` },
        next: { revalidate: 300 }
    })
    .then(async res => {
        if (!res.ok) {
            console.error(`Erreur lors de la récupération des événements Discord: ${res.status} ${res.statusText}`);
            return [];
        }
        return res.json();
    })
    .catch(err => {
        console.error('Erreur de réseau lors de la récupération des événements Discord:', err);
        return [];
    });
}

export default async function CalendarServerPage() {
    const eventsData = await fetchEventsData();

    // Filtre pour la notification (événements à venir)
    const upcomingEvents = eventsData.filter(event => new Date(event.scheduled_start_time) > new Date())
        .sort((a, b) => new Date(a.scheduled_start_time).getTime() - new Date(b.scheduled_start_time).getTime());

    return (
        // Passe les données récupérées au composant client pour l'affichage
        <CalendarClient eventsData={eventsData} upcomingEvents={upcomingEvents} />
    );
}
