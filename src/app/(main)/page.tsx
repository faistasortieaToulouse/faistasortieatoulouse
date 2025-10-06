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

  // --- Discord ---
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

  // --- Widget Discord public ---
  let discordData: DiscordWidgetData | null = null;
  try {
    const widgetRes = await fetch(`https://discord.com/api/guilds/${GUILD_ID}/widget.json`, { next: { revalidate: 300 } });
    if (widgetRes.ok) discordData = await widgetRes.json();
  } catch (e) {
    console.error('Erreur widget Discord:', e);
  }

  // --- Compter événements à venir sur 7 jours ---
  const upcomingEventsCount = discordData?.events
    ? discordData.events.filter(e => {
        const start = new Date(e.scheduled_start_time);
        const diff = (start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 7;
      }).length
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* HEADER */}
      <header className="flex flex-col items-center text-center space-y-6">
        <Image
          src={ftsLogoUrl}
          alt="FTS Logo"
          width={200}
          height={200}
          className="rounded-full shadow-md"
        />

        <div className="flex flex-wrap justify-center items-center gap-6 bg-purple-50 border border-purple-200 shadow-sm rounded-full px-6 py-3 text-gray-700">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            <span>{currentDa
