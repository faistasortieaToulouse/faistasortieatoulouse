'use client';

import { useMemo } from "react";
import dynamic from "next/dynamic";
import Image, { StaticImageData } from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Users, Calendar as CalendarIcon, BellRing, Store, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { DiscordEvent, DiscordWidgetData, CarouselImage } from "@/types/types";
import placeholderData from "@/lib/placeholder-images.json";

import { DashboardMenu } from "./DashboardMenu";
import { DiscordWidget } from "./discord-widget";
import { DiscordChannelList } from "./discord-channel-list";
import { DiscordEvents } from "./discord-events";
import { DiscordPolls } from "./discord-polls";
import { AiRecommendations } from "./ai-recommendations";
import InstallPWAiOS from "@/components/InstallPWAiOS";
import APKDownloadModal from "@/components/APKDownloadModal";
import React from "react";
import Carousel from "../components/Carousel";

const TimeWeatherBar = dynamic(
  () => import("./time-weather-bar").then(mod => mod.TimeWeatherBar),
  { ssr: false }
);

interface DashboardClientProps {
  discordData: DiscordWidgetData & { presence_count?: number };
  discordPolls: any[];
  eventsData: DiscordEvent[];
  totalMembers: number;
  ftsLogoUrl?: string | StaticImageData;
}

export default function DashboardClient({
  discordData,
  discordPolls,
  eventsData,
  totalMembers,
  ftsLogoUrl,
}: DashboardClientProps) {
  const { toast } = useToast();

  const onlineMembers = discordData.presence_count ?? 0;

  const upcomingEventsCount = useMemo(() => {
    const now = new Date();
    return eventsData.filter(ev => new Date(ev.scheduled_start_time) >= now).length;
  }, [eventsData]);

  const upcomingEventsWeekCount = useMemo(() => {
    const now = new Date();
    const sevenDays = new Date();
    sevenDays.setDate(now.getDate() + 7);
    return eventsData.filter(ev => {
      const start = new Date(ev.scheduled_start_time);
      return start >= now && start <= sevenDays;
    }).length;
  }, [eventsData]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mon Application TWA/PWA",
          text: "Téléchargez Mon Application pour ne rien manquer de nos événements et discussions !",
          url: "https://mon-appli-fictive.com",
        });
        toast({ title: "Partage réussi 🎉", description: "Merci d'avoir partagé l'application !" });
      } catch {
        toast({
          title: "Partage annulé",
          description: "Le partage a été interrompu ou non supporté par le navigateur.",
          variant: "destructive",
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

  const carouselImages: CarouselImage[] = placeholderData.carouselImages.map(
    (img: string | CarouselImage, index: number) =>
      typeof img === "string"
        ? { id: index.toString(), imageUrl: img, description: `Image ${index + 1}` }
        : img
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Carrousel */}
      <section>
        <Carousel images={carouselImages} />
      </section>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="p-4 flex flex-col justify-between min-h-[7rem] w-full">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-gray-700">Membres en ligne</div>
              <div className="text-2xl font-bold">{onlineMembers}</div>
              <div className="text-xs text-gray-500">Actuellement sur le Discord</div>
            </div>
            <Users className="h-5 w-5 text-primary" />
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between min-h-[7rem] w-full">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-gray-700">Événements à venir</div>
              <div className="text-2xl font-bold">{upcomingEventsCount}</div>
              <div className="text-xs text-gray-500">Planifiés sur le Discord</div>
            </div>
            <CalendarIcon className="h-5 w-5 text-primary" />
          </div>
        </Card>
      </div>

      {/* Menu dashboard */}
      <DashboardMenu ftsLogoUrl={ftsLogoUrl} />

      {/* Grille principale responsive avec scroll horizontal si besoin */}
      <section className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Colonne gauche */}
          <div className="flex flex-col gap-8">
            <Card className="p-4 w-full min-w-0">
              <h2 className="text-xl font-bold mb-3 text-primary">Événements Discord à Venir</h2>
              <div className="overflow-x-auto max-h-[400px] bg-gray-100 dark:bg-gray-800 w-full">
                <div className="min-w-max">
                  <DiscordEvents events={discordData.events} />
                </div>
              </div>
            </Card>

            <Card className="p-4 w-full min-w-0">
              <h2 className="text-xl font-bold mb-1 text-primary">Recommandations d'Événements IA</h2>
              <p className="text-sm text-gray-500 mb-4 break-words">
                Décrivez vos goûts et laissez l'IA vous suggérer des sorties à Toulouse !
              </p>
              <AiRecommendations eventData={JSON.stringify(discordData.events ?? [], null, 2)} />
            </Card>

            <Card className="p-4 flex justify-between items-start min-h-[7rem] w-full min-w-0">
              <div>
                <div className="text-sm text-gray-700">Membres sur le serveur</div>
                <div className="text-2xl font-bold">{totalMembers}</div>
                <div className="text-xs text-gray-500">Inscrits sur le Discord</div>
              </div>
              <Users className="h-5 w-5 text-primary" />
            </Card>
          </div>

{/* Colonne droite */}
    {/* Conteneur pour le Widget Discord et la Liste des Canaux */}
<div className="flex flex-col gap-8 min-w-0">
  <div className="w-full min-w-0">
    <DiscordWidget />
  </div>

  <div className="w-full min-w-0">
    <DiscordChannelList channels={discordData.channels} />
  </div>
</div>

    {/* La Liste des Canaux, elle prend maintenant toute la largeur de la colonne */}
    <Card className="p-4 w-full min-w-0">
        <h2 className="text-xl font-bold mb-3 text-primary">Salons du serveur</h2>
        <DiscordChannelList channels={discordData.channels} />
    </Card>

  <Card className="p-4 w-full min-w-0">
    <h2 className="text-xl font-bold mb-3 text-primary">Sondages Actifs sur Discord</h2>
    <div className="overflow-x-auto max-h-[400px] bg-gray-100 dark:bg-gray-800 w-full">
      <div className="min-w-max">
        <DiscordPolls polls={discordPolls} />
      </div>
    </div>
  </Card>
</div>
        </div>
      </section>

      {/* Notifications */}
      <Alert>
        <BellRing className="h-4 w-4" />
        <AlertTitle>Événements à Venir (7 Jours)</AlertTitle>
        <AlertDescription>
          {upcomingEventsWeekCount > 0
            ? `Il y a actuellement ${upcomingEventsWeekCount} événements prévus cette semaine !`
            : 'Aucun événement n’est prévu cette semaine. Consultez la liste ci-dessous pour organiser une sortie !'}
        </AlertDescription>
      </Alert>

      {/* Section téléchargement / partage */}
      <section className="flex flex-wrap justify-center gap-4 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl w-full">
        <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 w-full">
          <a
            href="https://play.google.com/store/apps/details?id=com.votre.appli.android"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 p-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition"
          >
            <Store className="h-5 w-5" />
            <Image
              src="/images/google-play-badge.png"
              alt="Disponible sur Google Play"
              width={180}
              height={53}
              className="w-auto h-auto"
            />
          </a>

          <APKDownloadModal />

          <InstallPWAiOS />

          <Button
            onClick={handleShare}
            className="flex items-center space-x-2 p-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg transition"
          >
            <Share2 className="h-5 w-5" />
            <span className="font-semibold">Partager l'application</span>
          </Button>
        </div>
      </section>
    </div>
  );
}
