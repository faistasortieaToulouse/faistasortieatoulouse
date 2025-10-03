import { DiscordStats } from '@/components/discord-stats';
import { DiscordWidget } from '@/components/discord-widget';
import { AiRecommendations } from '@/components/ai-recommendations';
import { DiscordChannelList } from '@/components/discord-channel-list';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { BellRing, Download, PartyPopper } from "lucide-react";
import Link from 'next/link';
import { DiscordEvents } from '@/components/discord-events';
// import { DISCORD_TOKEN } from '@/lib/discord-config'; // LIGNE SUPPRIMÉE !
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ImageCarousel } from '@/components/image-carousel';

export const revalidate = 300; // Revalidate at most every 5 minutes

// --- Constantes (ID de Guilde et Token lu directement de Vercel) ---
const GUILD_ID = '1422806103267344416';
// CORRECTION: Lit le token directement depuis process.env (Vercel)
const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN; 

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
    
    // Vérification du Token
    if (!DISCORD_TOKEN) {
        console.error("DISCORD_BOT_TOKEN est manquant ou non défini dans les variables d'environnement Vercel.");
        // Si le token manque, on retourne des données vides pour éviter le crash
        const emptyData: DiscordWidgetData = {
            id: GUILD_ID,
            name: 'Fais Ta Sortie à Toulouse',
            instant_invite: null,
            channels: [],
            members: [],
            presence_count: 0,
            events: []
        };
        // Rendre la page avec une alerte d'erreur si vous voulez
        // ... (Ou continuez avec les données vides)
    }

    // --- Récupération des Événements (API REST sécurisée) ---
    const eventsData: DiscordEvent[] = DISCORD_TOKEN ? await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/scheduled-events`, {
        headers: {
            // Utilisation sécurisée de la variable d'environnement
            Authorization: `Bot ${DISCORD_TOKEN}`, 
        },
        next: { revalidate: 300 } // Cache for 5 minutes
    })
    .then(async res => {
        if (!res.ok) {
            // Loggez l'erreur pour le débogage (ex: 403 Forbidden)
            const errorBody = await res.text().catch(() => 'No error body available');
            console.error(`Failed to fetch Discord events: ${res.status} ${res.statusText}. Details: ${errorBody}`);
            return []; 
        }
        return res.json();
    })
    .catch(err => {
        console.error('Error fetching Discord events:', err);
        return []; 
    }) : []; // Si le Token manque, retourne un tableau vide
    
    // --- Récupération des Salons et Membres (Widget API) ---
    // REMARQUE : Cette API n'est pas sécurisée par Token, elle ne voit que les salons publics.
    // Elle reste utilisée ici pour le compte de présence.
    const widgetData = await fetch(`https://discord.com/api/guilds/${GUILD_ID}/widget.json`, { next: { revalidate: 300 } })
        .then(res => res.json())
        .catch(() => null);


    // --- Combinaison des Données ---
    const discordData: DiscordWidgetData | null = widgetData ? {
        ...widgetData,
        events: eventsData // Remplace les événements du widget par les événements complets de l'API REST
    } : {
        // Fallback en cas d'échec de widget.json
        id: GUILD_ID,
        name: 'Fais Ta Sortie à Toulouse',
        instant_invite: null,
        channels: [],
        members: [],
        presence_count: 0,
        events: eventsData
    };

    // --- Rendu ---
    return (
        <div className="flex flex-col gap-8 p-4 md:p-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="font-headline text-4xl font-bold text-primary">Tableau de bord</h1>
                    <p className="mt-2 text-accent">
                        Application pour faire des sorties à Toulouse : discute des sorties, échange et organise.
                    </p>
                    <p className="mt-2 text-accent">
                        tout est gratuit et sans limite !
                    </p>
                </div>
            </header>

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

            <section>
                <Alert>
                    <BellRing className="h-4 w-4" />
                    <AlertTitle>Notifications Discord</AlertTitle>
                    <AlertDescription>
                        Les alertes pour les nouveaux événements et annonces importantes seront bientôt disponibles.
                    </Alertcription>
                </Alert>
            </section>
        </div>
    );
}
