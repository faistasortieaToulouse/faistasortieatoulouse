import { DiscordStats } from '@/components/discord-stats';
import { DiscordWidget } from '@/components/discord-widget';
import { AiRecommendations } from '@/components/ai-recommendations';
import { DiscordChannelList } from '@/components/discord-channel-list';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { BellRing, Download, PartyPopper, Cloud, Sun, CloudRain } from "lucide-react"; // Import des icônes météo
import Link from 'next/link';
import { DiscordEvents } from '@/components/discord-events';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ImageCarousel } from '@/components/image-carousel';

export const revalidate = 300; // Revalidate at most every 5 minutes

// --- Constantes (ID de Guilde) ---
const GUILD_ID = '1422806103267344416';

// --- Interfaces (Types de Données) ---
interface DiscordChannel {
    id: string;
    name: string;
    position: number;
    type: number;
    parent_id?: string;
}

interface DiscordEvent {
    id: string;
    name: string;
    description: string;
    scheduled_start_time: string;
    channel_id: string;
    // Ajoutez d'autres champs si votre composant DiscordEvents les utilise
}

interface DiscordWidgetData {
    id: string;
    name: string;
    instant_invite: string | null;
    channels: DiscordChannel[];
    members: any[];
    presence_count: number;
    events: DiscordEvent[]; // Contient les événements de l'API dédiée
}

// Interface pour la réponse simple de l'API Open-Meteo
interface WeatherData {
    current: {
        time: string;
        temperature_2m: number;
        weather_code: number;
        // ... autres champs
    };
    current_units: {
        temperature_2m: string;
    };
}


// --- Logique de Récupération des Données Côté Serveur (Next.js App Router) ---
export default async function DashboardPage() {
    
    // --- Calcul de la Date et de l'Heure Locales ---
    const now = new Date();
    const dateFormatter = new Intl.DateTimeFormat('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const timeFormatter = new Intl.DateTimeFormat('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        timeZoneName: 'short' 
    });

    const currentDate = dateFormatter.format(now);
    const currentTime = timeFormatter.format(now);
    // -----------------------------------------------------------


    // --- NOUVEAU : Récupération des Données Météo pour Toulouse ---
    const weatherUrl = 'https://api.open-meteo.com/v1/forecast?latitude=43.60&longitude=1.44&current=temperature_2m,weather_code&timezone=Europe%2FParis&forecast_days=1';
    
    let weatherData: WeatherData | null = null;
    let weatherDisplay = 'Météo indisponible 😕';
    let WeatherIcon = Cloud; // Icône par défaut

    try {
        const res = await fetch(weatherUrl, { next: { revalidate: 3600 } }); // Revalider toutes les heures
        weatherData = await res.json();

        if (weatherData && weatherData.current) {
            const temp = Math.round(weatherData.current.temperature_2m);
            const unit = weatherData.current_units.temperature_2m;
            const code = weatherData.current.weather_code;
            
            weatherDisplay = `${temp}${unit} à Toulouse`;
            
            // Logique simple pour l'icône basée sur le code météo (WMO)
            if (code >= 0 && code <= 1) {
                WeatherIcon = Sun; // Temps clair/ensoleillé
            } else if (code >= 2 && code <= 3) {
                WeatherIcon = Cloud; // Nuageux/partiellement nuageux
            } else if (code >= 51 && code <= 67 || code >= 80 && code <= 82) {
                WeatherIcon = CloudRain; // Pluie ou averses
            } else {
                WeatherIcon = Cloud; // Par défaut : Nuage
            }
        }
    } catch (e) {
        console.error('Erreur lors de la récupération de la météo:', e);
    }
    // ----------------------------------------------------------------


    const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN; 
    // ... (Récupération des données Discord inchangée) ...
    if (!DISCORD_TOKEN) {
        console.warn("DISCORD_BOT_TOKEN est manquant. Seules les données publiques (Widget API) seront disponibles.");
    }
    
    const channelsData: DiscordChannel[] = DISCORD_TOKEN ? await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/channels`, {
        headers: {
            Authorization: `Bot ${DISCORD_TOKEN}`, 
        },
        next: { revalidate: 300 } 
    })
    .then(async res => {
        if (!res.ok) {
            console.error(`Failed to fetch Discord channels: ${res.status} ${res.statusText}`);
            return []; 
        }
        return res.json();
    })
    .catch(err => {
        console.error('Error fetching Discord channels:', err);
        return []; 
    }) : []; 

    
    const eventsData: DiscordEvent[] = DISCORD_TOKEN ? await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/scheduled-events`, {
        headers: {
            Authorization: `Bot ${DISCORD_TOKEN}`, 
        },
        next: { revalidate: 300 } 
    })
    .then(async res => {
        if (!res.ok) {
            const errorBody = await res.text().catch(() => 'No error body available');
            console.error(`Failed to fetch Discord events: ${res.status} ${res.statusText}. Details: ${errorBody}`);
            return []; 
        }
        return res.json();
    })
    .catch(err => {
        console.error('Error fetching Discord events:', err);
        return []; 
    }) : []; 


    const oneWeek = 7 * 24 * 60 * 60 * 1000; 
    
    const upcomingEventsCount = eventsData.filter(event => {
        const startTime = new Date(event.scheduled_start_time);
        return startTime.getTime() > now.getTime() && (startTime.getTime() - now.getTime()) < oneWeek;
    }).length;


    const widgetData: { members?: any[], presence_count?: number, instant_invite: string | null } | null = await fetch(`https://discord.com/api/guilds/${GUILD_ID}/widget.json`, { next: { revalidate: 300 } })
        .then(res => res.json())
        .catch(() => null);


    const discordData: DiscordWidgetData | null = widgetData ? {
        ...widgetData,
        channels: channelsData, 
        events: eventsData
    } : {
        id: GUILD_ID,
        name: 'Fais Ta Sortie à Toulouse',
        instant_invite: null,
        channels: channelsData, 
        members: [],
        presence_count: 0,
        events: eventsData
    };

    // --- Rendu ---
    return (
        <div className="flex flex-col gap-8 p-4 md:p-8">
            
            {/* BARRE DE STATUT MISE À JOUR : Fond Violet et Météo */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-700 text-white shadow-lg">
                <p className="font-semibold text-base flex items-center gap-2">
                    <WeatherIcon className="h-5 w-5" />
                    {weatherDisplay}
                </p>
                <p className="text-sm font-light">
                    {currentDate} à **{currentTime}**
                </p>
            </div>
            {/* ------------------------------------------- */}

            <header>
                <h1 className="font-headline text-4xl font-bold text-primary">Tableau de bord</h1>
                <p className="mt-2 text-accent">
                    Application pour faire des sorties à Toulouse : discute des sorties, échange et organise.
                </p>
                <p className="mt-2 text-accent">
                    tout est gratuit et sans limite !
                </p>
            </header>

            <section>
              <ImageCarousel />
            </section>
            
            {/* ... Reste du JSX inchangé ... */}

            <section className="flex flex-wrap justify-center items-center gap-4">
                <Button asChild size="lg">
                    <Link href={`https://discord.com/channels/${GUILD_ID}/1422806103904882842`} target="_blank" rel="noopener noreferrer">
                        Pour commencer, clique ici :
                    </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                    <Link href="https://discord.com/download" target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-5 w-5" />
                        Télécharger Discord
                    </Link>
                </Button>
                <SidebarTrigger className="md:hidden" />
            </section>

            <section className="flex flex-wrap justify-center gap-4">
                <Button size="lg" variant="outline" disabled>
                    <PartyPopper className="mr-2 h-5 w-5" />
                    Girls Party
                </Button>
                <Button size="lg" variant="outline" disabled>
                    <PartyPopper className="mr-2 h-5 w-5" />
                    Student Event
                </Button>
            </section>

            <section>
                <DiscordStats data={discordData} />
            </section>
            
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex flex-col gap-8">
                    <AiRecommendations eventData={discordData?.events ? JSON.stringify(discordData.events, null, 2) : 'No event data available.'} />
                    <DiscordWidget />
                    <DiscordChannelList channels={discordData?.channels} />
                </div>
                <div className="flex flex-col gap-8">
                    <DiscordEvents events={discordData?.events} />
                </div>
            </section>

            {/* --- SECTION NOTIFICATIONS DYNAMIQUE --- */}
            <section>
                <Alert>
                    <BellRing className="h-4 w-4" />
                    <AlertTitle>Événements à Venir (7 Jours)</AlertTitle>
                    <AlertDescription>
                        {upcomingEventsCount > 0 ? (
                            <p className="font-bold text-lg text-primary">
                                Il y a actuellement **{upcomingEventsCount}** événements prévus cette semaine !
                            </p>
                        ) : (
                            'Aucun événement n’est prévu cette semaine. Consultez la liste ci-dessous pour organiser une sortie !'
                        )}
                    </AlertDescription>
                </Alert>
            </section>
            {/* ------------------------------------- */}
        </div>
    );
}
