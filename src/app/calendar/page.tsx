// src/app/calendar/page.tsx (NOUVEAU FICHIER)

import { DiscordEvent } from '@/types/discord'; // Si non défini, mettez l'interface ici
import CalendarClient from './page-client'; // Importe le composant client que nous allons créer
import { GUILD_ID } from '@/lib/discord-config'; // Assurez-vous que GUILD_ID est accessible

export const revalidate = 300; // Revalidate at most every 5 minutes

interface DiscordEvent {
    id: string;
    name: string;
    scheduled_start_time: string;
}

const GUILD_ID = '1422806103267344416'; // Mettez l'ID de guilde ici (ou importez-le)

// Logique de Récupération des Événements (copiée de (main)/page.tsx)
async function fetchEventsData(): Promise<DiscordEvent[]> {
    const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
    if (!DISCORD_TOKEN) {
        console.warn("DISCORD_BOT_TOKEN manquant pour les événements.");
        return [];
    }
    
    return fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/scheduled-events`, {
        headers: { Authorization: `Bot ${DISCORD_TOKEN}` },
        next: { revalidate: 300 }
    })
    .then(res => res.ok ? res.json() : (console.error(`Failed to fetch Discord events: ${res.status}`), []))
    .catch(err => {
        console.error('Error fetching Discord events:', err);
        return [];
    });
}

export default async function CalendarServerPage() {
    const eventsData = await fetchEventsData();

    // Filtre les événements à venir (pour la liste sur la page)
    const upcomingEvents = eventsData.filter(event => new Date(event.scheduled_start_time) > new Date())
        .sort((a, b) => new Date(a.scheduled_start_time).getTime() - new Date(b.scheduled_start_time).getTime());

    return (
        <CalendarClient eventsData={eventsData} upcomingEvents={upcomingEvents} />
    );
}
