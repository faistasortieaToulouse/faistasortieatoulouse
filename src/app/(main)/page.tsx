// src/app/(main)/page.tsx

import { DiscordStats } from '@/components/discord-stats';
import { DiscordWidget } from '@/components/discord-widget';
import { AiRecommendations } from '@/components/ai-recommendations';
import { DiscordChannelList } from '@/components/discord-channel-list';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { BellRing, Download, PartyPopper, Cloud, Sun, CloudRain, Calendar, Clock } from "lucide-react"; 
import Link from 'next/link';
import { DiscordEvents } from '@/components/discord-events';
// import { SidebarTrigger } from '@/components/ui/sidebar'; // Rendu inutile par le MainLayout
import { ImageCarousel } from '@/components/image-carousel';
import Image from 'next/image'; 

export const revalidate = 300; // Revalidate at most every 5 minutes

const GUILD_ID = '1422806103267344416';
const ftsLogoUrlPurple = "https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2FlogoFTS650bas.jpg?alt=media&token=a8b14c5e-5663-4754-a2fa-149f9636909c"; 

// ... (Les interfaces DiscordChannel, DiscordEvent, DiscordWidgetData, WeatherData restent inchangées) ...

export default async function DashboardPage() {
    // ... (Logique Date, Heure, Météo, Discord, etc. inchangée) ...

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8"> 
            
            {/* LOGO FTS - TOUT EN HAUT ET CENTRÉ */}
            <div className="flex justify-center w-full">
                <Image
                    src={ftsLogoUrlPurple}
                    alt="Logo FTS"
                    width={200} 
                    height={200}
                    className="rounded-full shadow-lg"
                />
            </div>
            
            {/* BARRE DE STATUT (DATE/HEURE/MÉTÉO) - SOUS LE LOGO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-center text-sm md:text-base">
                <div className="flex items-center justify-center p-3 bg-white rounded-xl shadow-md border border-gray-200">
                    <Calendar className="mr-2 h-5 w-5 text-purple-600" />
                    <span>{currentDate}</span>
                </div>
                <div className="flex items-center justify-center p-3 bg-white rounded-xl shadow-md border border-gray-200">
                    <Clock className="mr-2 h-5 w-5 text-purple-600" />
                    <span>{currentTime}</span>
                </div>
                <div className="flex items-center justify-center p-3 bg-white rounded-xl shadow-md border border-gray-200">
                    <WeatherIcon className="mr-2 h-5 w-5 text-purple-600" />
                    <span>{weatherDisplay}</span>
                </div>
            </div>

            {/* HEADER (TITRE, DESCRIPTION) - SOUS LA BARRE DE STATUT */}
            <header className="flex flex-col gap-4">
                {/* LIGNE DU TITRE */}
                <div className="flex justify-between items-center w-full">
                    <h1 className="font-headline text-4xl font-bold text-primary">Tableau de Bord</h1>
                    {/* LE SIDEBARTRIGGER A ÉTÉ SUPPRIMÉ ICI CAR IL EST GÉRÉ PAR MAINLAYOUT */}
                </div>

                {/* Descriptions (Sous le titre) */}
                <p className="mt-2 text-accent">
                    Application pour faire des sorties à Toulouse : discute des sorties, échange et organise.
                </p>
                <p className="mt-2 text-accent">
                    tout est gratuit et sans limite !
                </p>
            </header>

            {/* SECTION DU CARROUSEL : AJOUT DES CLASSES RESPONSIVES */}
            <section className="flex justify-center w-full"> 
                {/* Conteneur avec max-width variable en fonction de la taille d'écran */}
                <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl mx-auto">
                    <ImageCarousel />
                </div>
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
        </div>
    );
}
