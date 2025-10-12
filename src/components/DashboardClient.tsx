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

interface DashboardClientProps {
  discordData: DiscordWidgetData;
  discordPolls: any[];
  eventsData: DiscordEvent[];
}

//  carouselImages: string[]; // <-- ajouter
//  carouselImages, // <-- bien présent


export default function DashboardClient({
  discordData,
  discordPolls,
  eventsData,
}: DashboardClientProps) {
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

      {/* Discord Stats */}
      <section>
        <DiscordStats data={discordData} />
      </section>

      {/* Main Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Colonne gauche */}
        <div className="flex flex-col gap-8">
          <DiscordWidget />
          <DiscordChannelList channels={discordData?.channels} />
        </div>

        {/* Colonne droite */}
        <div className="flex flex-col gap-8">
          {/* IA Recommendations */}
          <div className="border rounded-lg shadow-sm p-4 bg-card text-card-foreground">
            <h2 className="text-xl font-bold mb-1 text-primary">Recommandations d'Événements IA</h2>
            <p className="text-sm text-gray-500 mb-4">
              Décrivez vos goûts et laissez l'IA vous suggérer des sorties à Toulouse !
            </p>
            <AiRecommendations eventData={discordData?.events ? JSON.stringify(discordData.events, null, 2) : 'No event data available.'} />
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

    </div>
  );
}
