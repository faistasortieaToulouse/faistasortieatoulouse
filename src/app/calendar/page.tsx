import CalendarClient from './page-client';

// FORCE LE RENDU DYNAMIQUE CÔTÉ SERVEUR (SSR)
// Ceci est CRUCIAL pour éviter le timeout de build, car l'appel API sera fait
// à chaque requête utilisateur plutôt que lors de la compilation.
export const dynamic = 'force-dynamic'; 

export const revalidate = 300; // Rafraîchissement des données toutes les 5 minutes (toujours utile pour les données dynamiques)

// Définitions nécessaires pour le serveur
interface DiscordEvent {
    id: string;
    name: string;
    scheduled_start_time: string;
    description?: string;
}

const GUILD_ID = '1422806103267344416'; // Votre ID de Guilde

// Logique de Récupération des Événements avec gestion du Timeout
async function fetchEventsData(): Promise<DiscordEvent[]> {
    const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
    if (!DISCORD_TOKEN) {
        console.warn("DISCORD_BOT_TOKEN est manquant. Les événements ne seront pas chargés.");
        // Retourne une erreur pour que le log dans Vercel soit clair, mais ne bloque pas la page
        return []; 
    }
    
    // --- GESTION DU TIMEOUT (10 secondes) ---
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes

    try {
        const res = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/scheduled-events`, {
            headers: { Authorization: `Bot ${DISCORD_TOKEN}` },
            signal: controller.signal, // Attache le signal d'annulation
            // Utiliser 'no-store' garantit que la donnée est toujours fraîche, 
            // mais 'force-dynamic' sur la page est suffisant
            cache: 'no-store', 
        });

        clearTimeout(timeoutId); // Annule le timeout si la réponse est reçue à temps

        if (!res.ok) {
            console.error(`Erreur lors de la récupération des événements Discord: ${res.status} ${res.statusText}`);
            return [];
        }
        return res.json();
    } catch (err) {
        clearTimeout(timeoutId);
        if ((err as Error).name === 'AbortError') {
            console.error('Erreur: Timeout de 10s atteint pour la récupération des événements Discord.');
        } else {
            console.error('Erreur de réseau ou de parsing lors de la récupération des événements Discord:', err);
        }
        return [];
    }
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
