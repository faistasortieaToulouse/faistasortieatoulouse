import { DiscordStats } from '@/components/discord-stats';
import { DiscordWidget } from '@/components/discord-widget';
import { AiRecommendations } from '@/components/ai-recommendations';
import { DiscordChannelList } from '@/components/discord-channel-list';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { BellRing, Download, PartyPopper, Cloud, Sun, CloudRain, Calendar, Clock } from "lucide-react";
import Link from 'next/link';
import { DiscordEvents } from '@/components/discord-events';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ImageCarousel } from '@/components/image-carousel';
import Image from 'next/image';

export const revalidate = 300;

const GUILD_ID = '1422806103267344416';
const ftsLogoUrl = "https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2FlogoFTS650bas.jpg?alt=media&token=a8b14c5e-5663-4754-a2fa-149f9636909c";

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

export default async function DashboardPage() {
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

  // --- Météo ---
  const weatherUrl = 'https://api.open-meteo.com/v1/forecast?latitude=43.60&longitude=1.44&current=temperature_2m,weather_code&timezone=Europe%2FParis&forecast_days=1';
  let weatherData: WeatherData | null = null;
  let weatherDisplay = 'Météo indisponible 😕';
  let WeatherIcon = Cloud;

  try {
    const res = await fetch(weatherUrl, { next: { revalidate: 3600 } });
    weatherData = await res.json();
    if (weatherData?.current) {
      const temp = Math.round(weatherData.current.temperature_2m);
      const unit = weatherData.current_units.temperature_2m;
      const code = weatherData.current.weather_code;
      weatherDisplay = `${temp}${unit} à Toulouse`;
      if (code >= 0 && code <= 1) WeatherIcon = Sun;
      else if (code >= 2 && code <= 3) WeatherIcon = Cloud;
      else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) WeatherIcon = CloudRain;
    }
  } catch (e) {
    console.error('Erreur météo:', e);
  }

  // --- Discord API ---
  const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
  let channelsData: DiscordChannel[] = [];
  let eventsData: DiscordEvent[] = [];
  if (DISCORD_TOKEN) {
    try {
      const channelsRes = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/channels`, {
        headers: { Authorization: `Bot ${DISCORD_TOKEN}` },
        next: { revalidate: 300 }
      });
      if (channelsRes.ok) channelsData = await channelsRes.json();

      const eventsRes = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/scheduled-events`, {
        headers: { Authorization: `Bot ${DISCORD_TOKEN}` },
        next: { revalidate: 300 }
      });
      if (eventsRes.ok) eventsData = await eventsRes.json();
    } catch (err) {
      console.error('Erreur Discord API:', err);
    }
  }

  // --- Widget Discord ---
  let discordData: DiscordWidgetData | null = null;
  try {
    const widgetRes = await fetch(`https://discord.com/api/guilds/${GUILD_ID}/widget.json`, { next: { revalidate: 300 } });
    if (widgetRes.ok) discordData = await widgetRes.json();
  } catch (e) {
    console.error('Erreur widget Discord:', e);
  }

  const upcomingEventsCount = eventsData.filter(e => {
    const start = new Date(e.scheduled_start_time);
    const diff = (start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  }).length;

  const onlineMembersCount = discordData?.members ? discordData.members.length : 0;

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* HEADER */}
      <header className="flex flex-col items-center text-center space-y-6">
        <Image src={ftsLogoUrl} alt="FTS Logo" width={200} height={200} className="rounded-full shadow-md" />

        <div className="flex flex-wrap justify-center items-center gap-6 bg-purple-50 border border-purple-200 shadow-sm rounded-full px-6 py-3 text-gray-700">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            <span>{currentDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-500" />
            <span>{currentTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <WeatherIcon className="h-5 w-5 text-blue-500" />
            <span>{weatherDisplay}</span>
          </div>
        </div>

        <div className="flex justify-between items-center w-full max-w-4xl px-4">
          <div className="text-left">
            <h1 className="text-4xl font-extrabold text-purple-700">Tableau de bord</h1>
            <p className="text-accent mt-2">
              Application communautaire gratuite pour organiser et rejoindre des sorties à Toulouse 🎉
            </p>
          </div>
          <SidebarTrigger />
        </div>
      </header>

      {/* Carousel */}
      <section>
        <ImageCarousel />
      </section>

      {/* Boutons action */}
      <section className="flex flex-wrap justify-center items-center gap-4">
        <Button asChild size="lg">
          <Link href={`https://discord.com/channels/${GUILD_ID}/1422806103904882842`} target="_blank" rel="noopener noreferrer">
            Rejoindre la communauté
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="https://discord.com/download" target="_blank" rel="noopener noreferrer">
            <Download className="mr-2 h-5 w-5" />
            Télécharger Discord
          </Link>
        </Button>
      </section>

      {/* Événements spéciaux */}
      <section className="flex flex-wrap justify-center gap-4">
        <Button size="lg" variant="outline" disabled>
          <PartyPopper className="mr-2 h-5 w-5" /> Girls Party
        </Button>
        <Button size="lg" variant="outline" disabled>
          <PartyPopper className="mr-2 h-5 w-5" /> Student Event
        </Button>
      </section>

      {/* Discord Stats */}
      <section>
        <DiscordStats data={discordData} />
      </section>

      {/* Recos + Events */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-8">
          <AiRecommendations eventData={JSON.stringify(eventsData || [], null, 2)} />
          <DiscordWidget />
          <DiscordChannelList channels={channelsData} />
        </div>
        <div className="flex flex-col gap-8">
          <DiscordEvents events={eventsData} />
        </div>
      </section>

      {/* Alerte événements */}
      <section className="space-y-4">
        <Alert>
          <BellRing className="h-4 w-4" />
          <AlertTitle>Événements à venir (7 jours)</AlertTitle>
          <AlertDescription>
            {upcomingEventsCount > 0 ? (
              <p className="font-bold text-lg text-primary">
                {upcomingEventsCount} événement(s) prévus cette semaine !
              </p>
            ) : (
              'Aucun événement prévu cette semaine. Créez le vôtre sur Discord !'
            )}
          </AlertDescription>
        </Alert>

        <Alert>
          <BellRing className="h-4 w-4" />
          <AlertTitle>Membres en ligne</AlertTitle>
          <AlertDescription>
            {onlineMembersCount > 0 ? (
              <p className="font-bold text-lg text-primary">
                {onlineMembersCount} actuellement sur le Discord
              </p>
            ) : (
              "Aucun membre n'est actuellement en ligne."
            )}
          </AlertDescription>
        </Alert>
      </section>
    </div>
  );
}
