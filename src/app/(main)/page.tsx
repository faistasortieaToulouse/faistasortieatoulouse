import { DiscordStats } from '@/components/discord-stats';
import { DiscordWidget } from '@/components/discord-widget';
import { AiRecommendations } from '@/components/ai-recommendations';
import { DiscordChannelList } from '@/components/discord-channel-list';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { BellRing, Download, PartyPopper } from "lucide-react";
import Link from 'next/link';
import { useState } from 'react';
import { DashboardMenu } from '@/components/dashboard-menu';
import { DiscordEvents } from '@/components/discord-events';
// Supprimé : import { DISCORD_TOKEN } from '@/lib/discord-config';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ImageCarousel } from '@/components/image-carousel';
import { TimeWeatherBar } from '@/components/time-weather-bar'; // <-- AJOUTEZ CETTE LIGNE
import Image from 'next/image';
import { DiscordPolls } from '@/components/discord-polls'; // <-- NOUVEL IMPORT

export const revalidate = 300; // Revalidate at most every 5 minutes

// --- Constantes (URL du Logo et ID de Guilde) ---
const GUILD_ID = '1422806103267344416';
const POLLS_CHANNEL_ID = '1422806103904882842'; // ID du salon #général
const FTS_LOGO_URL = 'https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2FlogoFTS650bas.jpg?alt=media&token=a8b14c5e-5663-4754-a2fa-149f9636909c';

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

// --- Logique de Récupération des Données Côté Serveur (Next.js App Router) ---
export default async function DashboardPage() {
    
    // CORRECTION MAJEURE : Lit le token directement depuis l'environnement Vercel
    const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN; 

    // Avertissement de sécurité si le jeton n'est pas défini.
    if (!DISCORD_TOKEN) {
        console.warn("DISCORD_BOT_TOKEN est manquant. Seules les données publiques (Widget API) seront disponibles.");
    }
    
    // --- Récupération des Salons (API REST sécurisée) ---
    const channelsData: DiscordChannel[] = DISCORD_TOKEN ? await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/channels`, {
        headers: {
            Authorization: `Bot ${DISCORD_TOKEN}`, 
        },
        next: { revalidate: 300 } // Cache for 5 minutes
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
    }) : []; // Si le Token manque, retourne un tableau vide

    
    // --- Récupération des Événements (API REST sécurisée) ---
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


    // --- Calcul du Compteur d'Événements à Venir (la "Notification") ---
    const now = new Date();
    // 7 jours en millisecondes pour filtrer les événements proches
    const oneWeek = 7 * 24 * 60 * 60 * 1000; 
    
    const upcomingEventsCount = eventsData.filter(event => {
        const startTime = new Date(event.scheduled_start_time);
        // L'événement doit être dans le futur ET dans les 7 prochains jours
        return startTime.getTime() > now.getTime() && (startTime.getTime() - now.getTime()) < oneWeek;
    }).length;


    // --- Récupération des Membres (Widget API) ---
    const widgetData: { members?: any[], presence_count?: number, instant_invite: string | null } | null = await fetch(`https://discord.com/api/guilds/${GUILD_ID}/widget.json`, { next: { revalidate: 300 } })
        .then(res => res.json())
        .catch(() => null);


    // --- Combinaison des Données ---
    const discordData: DiscordWidgetData | null = widgetData ? {
        ...widgetData,
        channels: channelsData, // Utilise les salons complets, lus par le Bot Admin
        events: eventsData
    } : {
        // Fallback en cas d'échec de widget.json
        id: GUILD_ID,
        name: 'Fais Ta Sortie à Toulouse',
        instant_invite: null,
        channels: channelsData, // Utilise les salons complets
        members: [],
        presence_count: 0,
        events: eventsData
    };


    // Dans DashboardPage() après la récupération des événements (eventsData)

// --- Récupération des Sondages (Messages) ---
let discordPolls: any[] = [];
if (DISCORD_TOKEN) {
    try {
        // Récupère les 10 derniers messages du salon #général
        const messagesRes = await fetch(`https://discord.com/api/v10/channels/${POLLS_CHANNEL_ID}/messages?limit=100`, {
            headers: {
                Authorization: `Bot ${DISCORD_TOKEN}`, 
            },
            next: { revalidate: 60 } // Rafraîchissement plus fréquent pour les sondages (1 minute)
        });
        
        if (!messagesRes.ok) {
            console.error(`Failed to fetch Discord messages for polls: ${messagesRes.status} ${messagesRes.statusText}`);
        } else {
            const messagesData: any[] = await messagesRes.json();
            // Filtrer pour ne garder que les messages qui contiennent un champ 'poll' et ne sont pas expirés
            discordPolls = messagesData.filter(message => message.poll && !message.poll.expired);
        }
    } catch (err) {
        console.error('Error fetching Discord messages for polls:', err);
    }
}


    // --- Rendu ---
    return (
        <div className="flex flex-col gap-8 p-4 md:p-8">
<header className="flex items-start justify-between">
    <div>
        <h1 className="font-headline text-4xl font-bold text-primary">Tableau de bord</h1>
        <p className="mt-2 text-accent">
            Application pour faire des sorties à Toulouse : discute des sorties, échange et organise.
        </p>
        <p className="mt-2 text-accent">
            tout est gratuit et sans limite !
        </p>
    </div>
    
    {/* --- LOGO AJOUTÉ À DROITE --- */}
    <div className="relative w-24 h-24 flex-shrink-0">
        <Image
            src={FTS_LOGO_URL}
            alt="Logo FTS"
            fill
            className="rounded-lg object-cover"
            sizes="96px"
        />
    </div>
    {/* --------------------------- */}
</header>
            
            {/* --- NOUVELLE BARRE DATE/HEURE/MÉTÉO --- */}
            <TimeWeatherBar />
            {/* -------------------------------------- */}
            
            <section>
              <ImageCarousel />
            </section>

<section className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
  {/* Desktop : boutons visibles */}
  <div className="hidden md:flex flex-wrap gap-4">
    <Button asChild size="lg">
      <Link href={`https://discord.com/channels/${GUILD_ID}/1422806103904882842`} target="_blank">
        Pour commencer
      </Link>
    </Button>
    <Button asChild size="lg" variant="outline">
      <Link href="https://discord.com/download" target="_blank">
        <Download className="mr-2 h-5 w-5" />
        Télécharger Discord
      </Link>
    </Button>
    <Button size="lg" variant="outline" disabled>
      <PartyPopper className="mr-2 h-5 w-5" />
      Girls Party
    </Button>
    <Button size="lg" variant="outline" disabled>
      <PartyPopper className="mr-2 h-5 w-5" />
      Student Event
    </Button>
    <Button size="lg" variant="outline" disabled>
      <PartyPopper className="mr-2 h-5 w-5" />
      Rando Trip
    </Button>
  </div>

  {/* Mobile : menu burger */}
  <DashboardMenu />
</section>

            <section>
                <DiscordStats data={discordData} />
            </section>
            
            {/* REMPLACER LA SECTION SUIVANTE DANS DashboardPage() */}

<section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    
    {/* 1. Colonne de Gauche (MAINTENANT AVEC WIDGET & CHANNELS) */}
    <div className="flex flex-col gap-8">
        <DiscordWidget />
        <DiscordChannelList channels={discordData?.channels} />
    </div>
    
    {/* 2. Colonne de Droite (MAINTENANT AVEC IA EN PREMIER) */}
    <div className="flex flex-col gap-8">
        
        {/* --- 🆕 1er Élément : Recommandations d'Événements IA --- */}
        <div className="border rounded-lg shadow-sm p-4 bg-card text-card-foreground">
            <h2 className="text-xl font-bold mb-1 text-primary">Recommandations d'Événements IA</h2>
            <p className="text-sm text-gray-500 mb-4">
                Décrivez vos goûts et laissez l'IA vous suggérer des sorties à Toulouse !
            </p>
            
            <AiRecommendations 
                eventData={discordData?.events ? JSON.stringify(discordData.events, null, 2) : 'No event data available.'} 
            />
        </div>
        {/* ---------------------------------------------------- */}

        {/* 2ème Élément : ÉVÈNEMENTS À VENIR dans un encart défilant */}
        <div className="border rounded-lg shadow-sm p-4 bg-card text-card-foreground">
            <h2 className="text-xl font-bold mb-3 text-primary">Événements Discord à Venir</h2>
            <div className="max-h-[400px] min-h-[400px] overflow-y-auto pr-2 bg-gray-100 dark:bg-gray-800">
                <DiscordEvents events={discordData?.events} />
            </div>
        </div>
        
        {/* 3ème Élément : Sondages Discord */}
        <DiscordPolls polls={discordPolls} /> 
    </div>
</section>

            {/* --- SECTION NOTIFICATIONS DYNAMIQUE --- */}
{/* ... (le reste du code continue ici) */}

            {/* --- SECTION NOTIFICATIONS DYNAMIQUE --- */}
{/* Dans src/app/(main)/page.tsx, dans la section <section className="grid..."> */}


            {/* ------------------------------------- */}
        </div>
    );
}
