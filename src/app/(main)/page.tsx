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
// AJOUT de Image à partir de 'next/image' pour optimiser l'affichage du logo
import Image from 'next/image';

export const revalidate = 300; // Revalidate at most every 5 minutes

// --- Constantes (ID de Guilde et URL du Logo) ---
const GUILD_ID = '1422806103267344416';
const ftsLogoUrl = "https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2FlogofaistasortieToulouse105.png?alt=media&token=4ed06e88-d01b-403c-8cff-049c5943c0e2";
// NOUVELLE CONSTANTE POUR LE LOGO VIOLET
const ftsLogoUrlPurple = "https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2FlogoFTSvioletpourpre.png?alt=media&token=ac9e92a4-2904-402a-ae24-997f7d3e6f0b";

// --- Interfaces (Types de Données) ---
// ... (Interfaces inchangées)

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
            
            // CORRECTION: Utilisation des backticks (template literal)
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
    
    // CORRECTION: Utilisation des backticks (template literal) pour l'URL
    const channelsData: DiscordChannel[] = DISCORD_TOKEN ? await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/channels`, {
        headers: {
            // CORRECTION: Utilisation des backticks (template literal) pour le header
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
    .catch(e => {
        console.error('Erreur lors de la récupération des canaux Discord:', e);
        return [];
    })
    : []; 

    // --- Récupération des Données du Widget Discord (inchangée) ---
    const discordWidgetUrl = `https://discord.com/api/v10/guilds/${GUILD_ID}/widget.json`;
    
    let discordData: DiscordWidgetData | null = null;
    let upcomingEventsCount = 0;

    try {
        const res = await fetch(discordWidgetUrl, { next: { revalidate: 300 } });
        discordData = await res.json();

        // Calcul du nombre d'événements à venir (dans les 7 jours)
        const oneWeekFromNow = now.getTime() + 7 * 24 * 60 * 60 * 1000;
        upcomingEventsCount = discordData?.events?.filter(event => 
            new Date(event.scheduled_start_time).getTime() < oneWeekFromNow
        ).length || 0;

    } catch (e) {
        console.error('Erreur lors de la récupération du widget Discord:', e);
    }
    // ----------------------------------------------------------------

    // --- Rendu du Composant (Next.js App Router) ---
    return (
        <div className="flex flex-col gap-10 p-4 md:p-8">
            <header className="space-y-4">
                {/* --- BLOC PRINCIPAL AVEC LOGO ET TITRE (CENTRALISÉ) --- */}
                <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="flex items-center space-x-4">
                        {/* AJOUT du logo FTS avec Image de Next.js */}
                        <Image
                            src={ftsLogoUrlPurple}
                            alt="Logo FTS"
                            width={50} // Ajustez la taille selon vos besoins
                            height={50} // Ajustez la taille selon vos besoins
                            className="rounded-full shadow-lg" // Optionnel: pour un style plus sympa
                        />
                        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                            Tableau de Bord
                        </h1>
                    </div>
                    
                    {/* --- Bloc Date/Heure/Météo (Maintenu) --- */}
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-muted-foreground text-sm">
                        <span className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4" />
                            {currentDate}
                        </span>
                        <span className="flex items-center">
                            <Clock className="mr-2 h-4 w-4" />
                            {currentTime}
                        </span>
                        <span className="flex items-center">
                            <WeatherIcon className="mr-2 h-4 w-4" />
                            {weatherDisplay}
                        </span>
                    </div>
                </div>
                {/* ------------------------------------------------ */}
            </header>
            
            {/* --- SECTION DESCRIPTION RAPIDE --- */}
            <div className="bg-primary/10 p-6 rounded-lg shadow-inner">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-2xl font-semibold text-primary mb-2">
                        Bienvenue !
                    </h2>
                    <p className="text-muted-foreground">
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
                    {/* CORRECTION: Utilisation des backticks (template literal) pour l'URL */}
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
                {/* Le SidebarTrigger redondant a été retiré. */}
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
