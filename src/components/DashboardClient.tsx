'use client';

import { useMemo } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Users, Calendar as CalendarIcon, BellRing, Store, Apple, Share2 } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import { DiscordEvent, DiscordWidgetData, CarouselImage } from "@/types/types";
import { ImageCarousel } from "@/components/image-carousel";
import placeholderData from "@/lib/placeholder-images.json";

import { DashboardMenu } from "./DashboardMenu";
import { DiscordWidget } from "./discord-widget";
import { DiscordChannelList } from "./discord-channel-list";
import { DiscordEvents } from "./discord-events";
import { DiscordPolls } from "./discord-polls";
import { AiRecommendations } from "./ai-recommendations";

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const TimeWeatherBar = dynamic(
  () => import("./time-weather-bar").then(mod => mod.TimeWeatherBar),
  { ssr: false }
);

interface DashboardClientProps {
  discordData: DiscordWidgetData & { presence_count?: number }; // Ajout de presence_count
  discordPolls: any[];
  eventsData: DiscordEvent[];
  totalMembers: number;
  ftsLogoUrl?: string;
}

export default function DashboardClient({
  discordData,
  discordPolls,
  eventsData,
  totalMembers,
  ftsLogoUrl,
}: DashboardClientProps) {
  const { toast } = useToast();

  const carouselImages: string[] = placeholderData.carouselImages
    .map((img: string | CarouselImage) => typeof img === "string" ? img : img.imageUrl)
    .filter((url): url is string => !!url && url.length > 0);

  const onlineMembers = discordData?.presence_count || 0;

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
      } catch (error) {
        toast({
          title: "Partage annulé",
          description: "Le partage a été interrompu ou le navigateur ne le supporte pas.",
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

  return (
    <div className="flex flex-col gap-6 w-full">
      <section>
        <ImageCarousel images={carouselImages} />
      </section>

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

      <div className="w-full mt-4">
        <DashboardMenu ftsLogoUrl={ftsLogoUrl} />
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full overflow-hidden">
        <div className="flex flex-col gap-8">
          <div className="border rounded-lg shadow-sm p-4 bg-card text-card-foreground">
            <h2 className="text-xl font-bold mb-3 text-primary">Événements Discord à Venir</h2>
            <div className="max-h-[400px] min-h-[400px] overflow-y-auto pr-2 bg-gray-100 dark:bg-gray-800">
              <DiscordEvents events={discordData?.events} />
            </div>
          </div>

          <div className="border rounded-lg shadow-sm p-4 bg-card text-card-foreground">
            <h2 className="text-xl font-bold mb-1 text-primary">Recommandations d'Événements IA</h2>
            <p className="text-sm text-gray-500 mb-4">
              Décrivez vos goûts et laissez l'IA vous suggérer des sorties à Toulouse !
            </p>
            <AiRecommendations
              eventData={discordData?.events ? JSON.stringify(discordData.events, null, 2) : 'No event data available.'}
            />
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <DiscordWidget />
          <DiscordChannelList channels={discordData?.channels} />

          <div className="border rounded-lg shadow-sm p-4 bg-card text-card-foreground">
            <h2 className="text-xl font-bold mb-3 text-primary">Sondages Actifs sur Discord</h2>
            <div className="max-h-[400px] overflow-y-auto pr-2 bg-gray-100 dark:bg-gray-800">
              <div className="min-h-[100px]">
                <DiscordPolls polls={discordPolls} />
              </div>
            </div>
          </div>

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
      </section>

      <section>
        <Alert>
          <BellRing className="h-4 w-4" />
          <AlertTitle>Événements à Venir (7 Jours)</AlertTitle>
          <AlertDescription>
            {upcomingEventsWeekCount > 0 ? (
              <p className="font-bold text-lg text-primary">
                Il y a actuellement {upcomingEventsWeekCount} événements prévus cette semaine !
              </p>
            ) : (
              'Aucun événement n’est prévu cette semaine. Consultez la liste ci-dessous pour organiser une sortie !'
            )}
          </AlertDescription>
        </Alert>
      </section>

      <section className="flex flex-wrap justify-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border">
        <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 w-full">
          <Link
            href="https://play.google.com/store/apps/details?id=com.votre.appli.android"
            target="_blank"
            className="flex items-center space-x-2 p-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-300"
          >
            <Store className="h-5 w-5" />
            <Image src="/images/google-play-badge.png" alt="Disponible sur Google Play" width={180} height={53} />
          </Link>

          <Link
            href="/votre-application.apk"
            download
            className="flex items-center space-x-2 p-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
          >
            <Store className="h-5 w-5" />
            <span className="leading-tight text-center">
              Télécharger le fichier APK (TWA)
              <br />
              <span className="text-sm font-normal opacity-90">pour Android</span>
            </span>
          </Link>

          <Link
            href="/install-pwa-ios"
            className="flex items-center space-x-2 p-3 bg-white text-gray-800 border border-gray-300 rounded-lg shadow-md hover:bg-gray-100 transition duration-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            <Apple className="h-5 w-5" />
            <span className="font-semibold">Installer l'Appli sur iPhone (PWA)</span>
          </Link>

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
