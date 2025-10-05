import { DiscordStats } from '@/components/discord-stats';
import { DiscordWidget } from '@/components/discord-widget';
import { AiRecommendations } from '@/components/ai-recommendations';
import { DiscordChannelList } from '@/components/discord-channel-list';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
// AJOUT de Calendar et Clock aux imports de lucide-react
import { BellRing, Download, PartyPopper, Cloud, Sun, CloudRain, Calendar, Clock } from "lucide-react"; 
import Link from 'next/link';
import { DiscordEvents } from '@/components/discord-events';
import { SidebarTrigger } from '@/components/ui/sidebar'; // NOTE: Ceci doit être remplacé par ToggleInMainButton si vous utilisez le code de RootLayout.jsx

import { ImageCarousel } from '@/components/image-carousel';

export const revalidate = 300; // Revalidate at most every 5 minutes

// --- Constantes (ID de Guilde et URL du Logo) ---
const GUILD_ID = '1422806103267344416';
const ftsLogoUrl = "https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2FlogofaistasortieToulouse105.png?alt=media&token=4ed06e88-d01b-403c-8cff-049c5943c0e2";

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
}

interface DiscordWidgetData {
    id: string;
    name: string;
    instant_invite: string | null;
    channels: DiscordChannel[];
    members: any[];
    presence_count: number;
    events: DiscordEvent[];
}

// Interface pour la réponse simple de l'API Open-Meteo
interface WeatherData {
    current: {
        time: string;
        temperature_2m: number;
        weather_code: number;
    };
    current_units: {
        temperature_2m: string;
    };
}

// --- Logique de Récupération des Données Côté Serveur (Next.js App Router) ---
export default async function DashboardPage() {
    
    // --- Calcul de la Date et de l'Heure Locales (avec TimeZone Paris) ---
    const now = new Date();
    
    const dateFormatter = new Intl.DateTimeFormat('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'Europe/Paris' 
    });
    const timeFormatter = new Intl.DateTimeFormat('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        timeZoneName: 'short',
        timeZone: 'Europe/Paris' 
    });

    const currentDate = dateFormatter.format(now);
    const currentTime = timeFormatter.format(now);
    // -----------------------------------------------------------

    // --- Récupération des Données Météo pour Toulouse (inchangée) ---
    const weatherUrl = 'https://api.open-meteo.com/v1/forecast?latitude=43.60&longitude=1.44&current=temperature_2m,weather_code&timezone=Europe%2FParis&forecast_days=1';
    
    let weatherData: WeatherData | null = null;
    let weatherDisplay = 'Météo indisponible 😕';
    let WeatherIcon = Cloud; 

    try {
        const res = await fetch(weatherUrl, { next: { revalidate: 3600 } }); 
        weatherData = await res.json();

        if (weatherData && weatherData.current) {
            const temp = Math.round(weatherData.current.temperature_2m);
            const unit = weatherData.current_units.temperature_2m;
            const code = weatherData.current.weather_code;
            
            // CORRIGÉ : Utilisation de template literals (backticks)
            weatherDisplay = `${temp}${unit} à Toulouse`;
            
            // Logique simple pour l'icône basée sur le code météo (WMO)
            if (code >= 0 && code <= 1) {
                WeatherIcon = Sun; 
            } else if (code >= 2 && code <= 3) {
                WeatherIcon = Cloud; 
            } else if (code >= 51 && code <= 67 || code >= 80 && code <= 82) {
                WeatherIcon = CloudRain; 
            } else {
                WeatherIcon = Cloud; 
            }
        }
    } catch (e) {
        console.error('Erreur lors de la récupération de la météo:', e);
    }
    // ----------------------------------------------------------------

    const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN; 
    
    if (!DISCORD_TOKEN) {
        console.warn("DISCORD_BOT_TOKEN est manquant. Seules les données publiques (Widget API) seront disponibles.");
    }
    
    // CORRIGÉ : Utilisation de template literals (backticks)
    const channelsData: DiscordChannel[] = DISCORD_TOKEN ? await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/channels`, {
        headers: {
            // CORRIGÉ : Utilisation de template literals (backticks)
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

    
    // CORRIGÉ : Utilisation de template literals (backticks)
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

    // CORRIGÉ : Utilisation de template literals (backticks)
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
            
            {/* BARRE DE STATUT MISE À JOUR : Date, Heure, Météo séparées */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-3 rounded-lg bg-[#A020F0] text-white shadow-lg text-sm md:text-base">
                
                {/* 1. Date */}
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">{currentDate}</span>
                </div>

                {/* 2. Heure */}
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{currentTime}</span>
                </div>

                {/* 3. Météo */}
                <div className="flex items-center gap-2">
                    <WeatherIcon className="h-4 w-4" />
                    <span className="font-medium">{weatherDisplay}</span>
                </div>
            </div>
            {/* ------------------------------------------- */}

        {/* NOUVELLE STRUCTURE D'EN-TÊTE DU TABLEAU DE BORD AVEC LE BOUTON TOGGLE ET LE LOGO */}

            <div className="flex flex-col gap-2">
{/* Ligne Titre + Bouton + Logo */}
<header className="flex items-center justify-between border-b pb-2">
{/* Conteneur pour le titre et le bouton de bascule (Burger) */}
<div className="flex items-center gap-4">
                    <h1 className="font-headline text-4xl font-bold text-gray-800">Tableau de bord</h1>
                    
                    {/* MODIFIÉ: Déplacé à droite du titre */}
                    <SidebarTrigger
                        className="flex"
                    />
                </div>
                
                {/* Logo à droite du titre */}
                <img
                    src={ftsLogoUrl} 
                    alt="FTS Logo Dashboard"
                    width={40}
                    height={40}
                    className="rounded-full shadow-lg"
                />
            </header>
            
            {/* Description sous le titre */}
            <div>

                    <p className="mt-2 text-accent">
                        Application pour faire des sorties à Toulouse : discute des sorties, échange et organise.
                    </p>
                    <p className="mt-2 text-accent">
                        tout est gratuit et sans limite !
                    </p>
</div>
</div>

            <section>
              <ImageCarousel />
            </section>
            
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
                {/* SUPPRIMÉ : L'instance redondante de SidebarTrigger a été supprimée, car elle est maintenant dans l'en-tête. */}
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
                                Il y a actuellement {upcomingEventsCount} événements prévus cette semaine !
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
