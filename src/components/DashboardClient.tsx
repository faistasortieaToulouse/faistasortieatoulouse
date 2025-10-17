'use client';

import { useMemo } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar as CalendarIcon, MessageSquare, BellRing } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { DiscordEvent, DiscordWidgetData } from "@/types/types";
import { carouselImages as placeholderCarouselImages } from "@/lib/placeholder-images";
import { DashboardMenu } from "./DashboardMenu";
import { ImageCarousel } from "@/components/image-carousel";
import placeholderData from '@/lib/placeholder-images.json';
import dynamic from "next/dynamic";

// Import dynamique de TimeWeatherBar → pas de SSR
const TimeWeatherBar = dynamic(() => import("./time-weather-bar").then(mod => mod.TimeWeatherBar), { ssr: false });

// Import des composants Discord
import { DiscordStats } from "./discord-stats";
import { DiscordWidget } from "./discord-widget";
import { DiscordChannelList } from "./discord-channel-list";
import { DiscordEvents } from "./discord-events";
import { DiscordPolls } from "./discord-polls";
import { AiRecommendations } from "./ai-recommendations";

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Imports pour les boutons de l'application
import { Store, Apple, Share2 } from "lucide-react";
import Link from 'next/link'; 
import { Button } from "@/components/ui/button"; 
import { useToast } from "@/hooks/use-toast";

interface DashboardClientProps {
  discordData: DiscordWidgetData;
  discordPolls: any[];
  eventsData: DiscordEvent[];
  totalMembers: number; // <-- ajout
}

//  carouselImages: string[]; // <-- ajouter
//  carouselImages, // <-- bien présent


export default function DashboardClient({
  discordData,
  discordPolls,
  eventsData,
  totalMembers,
}: DashboardClientProps) {
  const { toast } = useToast(); // Cette ligne doit être présente !
const carouselImages: string[] = placeholderData.carouselImages
  .map((img: any) => (typeof img === 'string' ? img : img.imageUrl))
  .filter((url): url is string => !!url && url.length > 0);
  const onlineMembers = discordData?.presence_count || 0;

const upcomingEventsCount = useMemo(() => {
  const now = new Date();
  const sevenDays = new Date();
  sevenDays.setDate(now.getDate() + 7);
  return eventsData.filter(ev => {
    const start = new Date(ev.scheduled_start_time);
    return start >= now && start <= sevenDays;
  }).length;
}, [eventsData]);

  // 💥 NOUVEAU : Formate les données des événements pour le prompt IA 💥
const eventDataString = useMemo(() => {
    if (!eventsData || eventsData.length === 0) {
        return "Aucun événement Discord trouvé.";
    }
    // Formate le tableau d'événements en une chaîne de caractères structurée
    return eventsData.map(ev => 
        `Titre: ${ev.name} | Date: ${new Date(ev.scheduled_start_time).toLocaleString('fr-FR')} | Description: ${ev.description || 'Pas de description.'}`
    ).join('\n---\n');
}, [eventsData]);

  // Fonction pour gérer le partage de l'application
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mon Application TWA/PWA",
          text: "Téléchargez Mon Application pour ne rien manquer de nos événements et discussions !",
          url: "https://mon-appli-fictive.com", 
        });
        toast({
          title: "Partage réussi 🎉",
          description: "Merci d'avoir partagé l'application !",
        });
      } catch (error) {
        console.error("Erreur de partage :", error);
        toast({
          title: "Partage annulé",
          description: "Le partage a été interrompu ou le navigateur ne le supporte pas.",
          variant: "destructive"
        });
      }
    } else {
      navigator.clipboard.writeText("https://mon-appli-fictive.com");
      toast({
        title: "Lien copié !",
        description: "Le lien de l'application a été copié dans votre presse-papiers.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <section>
        <ImageCarousel images={carouselImages} />
      </section>

      {/* Stats au-dessus de la barre date/heure/météo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="relative p-4 flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-gray-700">Membres en ligne</div>
              <div className="text-2xl font-bold">{onlineMembers}</div>
              <div className="text-xs text-gray-500">Actuellement sur le Discord</div>
            </div>
            <Users className="h-5 w-5 text-primary self-start" />
          </div>
        </Card>

        <Card className="relative p-4 flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-gray-700">Événements à venir</div>
              <div className="text-2xl font-bold">{upcomingEventsCount}</div>
              <div className="text-xs text-gray-500">Planifiés sur le Discord</div>
            </div>
            <CalendarIcon className="h-5 w-5 text-primary self-start" />
          </div>
        </Card>
      </div>

      {/* DashboardMenu sous le carrousel */}
      <div className="w-full mt-4">
        <DashboardMenu />
      </div>

      {/* Main Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
{/* Colonne gauche */}
<div className="flex flex-col gap-8">
  <DiscordWidget />
  <DiscordChannelList channels={discordData?.channels} />

  {/* Total des membres du serveur */}
  <Card className="relative p-4 flex flex-col justify-between h-28">
    <div className="flex justify-between items-start">
      <div>
        <div className="text-sm text-gray-700">Membres sur le serveur</div>
        <div className="text-2xl font-bold">{totalMembers}</div> 
        <div className="text-xs text-gray-500">Inscrits sur le Discord</div>
      </div>
      <Users className="h-5 w-5 text-primary self-start" />
    </div>
  </Card>
</div>

        {/* Colonne droite */}
        <div className="flex flex-col gap-8">
          {/* IA Recommendations */}
          <div className="border rounded-lg shadow-sm p-4 bg-card text-card-foreground">
            <h2 className="text-xl font-bold mb-1 text-primary">Recommandations d'Événements IA</h2>
            <p className="text-sm text-gray-500 mb-4">
              Décrivez vos goûts et laissez l'IA vous suggérer des sorties à Toulouse !
            </p>
{/* 🚀 AJOUTEZ CETTE LIGNE (ou ces lignes) POUR L'IA 🚀 */}
  {/* AJOUT DE LA PROP eventDataString */}
  <AiRecommendations eventData={eventDataString} /> 
        {/* ---------------------------------------------------- */}
          </div>


          {/* Événements à venir */}
          <div className="border rounded-lg shadow-sm p-4 bg-card text-card-foreground">
            <h2 className="text-xl font-bold mb-3 text-primary">Événements Discord à Venir</h2>
            <div className="max-h-[400px] min-h-[400px] overflow-y-auto pr-2 bg-gray-100 dark:bg-gray-800">
              <DiscordEvents events={discordData?.events} />
            </div>
          </div>

          {/* Sondages */}
          <div className="border rounded-lg shadow-sm p-4 bg-card text-card-foreground">
            <h2 className="text-xl font-bold mb-3 text-primary">Sondages Actifs sur Discord</h2>
            <div className="max-h-[400px] overflow-y-auto pr-2 bg-gray-100 dark:bg-gray-800">
              <div className="min-h-[100px]">
                <DiscordPolls polls={discordPolls} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notifications */}
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

      {/* NOUVELLE SECTION À LA FIN POUR TÉLÉCHARGEMENT/PARTAGE */}
      <section className="flex flex-wrap justify-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border">

            {/* NOUVEAU CONTENEUR pour les boutons. Utilisez 'flex-wrap' ici si vous voulez qu'ils restent sur une seule ligne sur grand écran, sinon utilisez 'flex-col' */}

                <div className="flex flex-wrap justify-center gap-4 w-full"> 

        {/* 1. Lien Google Play (TWA Android) */}
        <Link 
          href="https://play.google.com/store/apps/details?id=com.votre.appli.android" 
          target="_blank" 
          className="flex items-center space-x-2 p-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-300"
        >
          <Store className="h-5 w-5" />
          {/* Utilisation du badge officiel Google Play */}
          <Image
            src="/images/google-play-badge.png" // ⬅️ Le chemin de votre badge
            alt="Disponible sur Google Play"
            width={180} // Ajustez la taille selon vos besoins
            height={53} // Ajustez la taille selon vos besoins
          />
        </Link>

        {/* 🚀 NOUVEAU BOUTON : Téléchargement direct APK/TWA */}
        <Link 
          href="/votre-application.apk" // ⬅️ REMPLACER PAR LE CHEMIN VERS VOTRE APK
          download // Important : force le téléchargement du fichier
          className="flex items-center space-x-2 p-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
        >
          <Store className="h-5 w-5" />

   <span className="leading-tight">
    Télécharger le fichier APK (TWA)
    <br />
    <span className="text-sm font-normal opacity-90">pour Android</span>
  </span>

        </Link>

        {/* 2. Lien/Instructions pour PWA (Apple/iOS) */}
        <Link 
          href="/install-pwa-ios" 
          className="flex items-center space-x-2 p-3 bg-white text-gray-800 border border-gray-300 rounded-lg shadow-md hover:bg-gray-100 transition duration-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
        >
          <Apple className="h-5 w-5" />
          <span className="font-semibold">Installer l'Appli sur iPhone (PWA)</span>
        </Link>

        {/* 3. Bouton de Partage */}
        <Button 
          onClick={handleShare} 
          className="flex items-center space-x-2 p-3 bg-primary text-primary-foreground rounded-lg shadow-md hover:bg-primary/90 transition duration-300"
        >
          <Share2 className="h-5 w-5" />
          <span className="font-semibold">Partager l'application</span>
        </Button>

           </div>

      </section>

    </div>
  );
}
