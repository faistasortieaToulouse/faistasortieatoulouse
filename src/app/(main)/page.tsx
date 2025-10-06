import { DiscordStats } from '@/components/discord-stats';
import { DiscordWidget } from '@/components/discord-widget';
import { AiRecommendations } from '@/components/ai-recommendations';
import { DiscordChannelList } from '@/components/discord-channel-list';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { BellRing, Download, PartyPopper, Cloud, Sun, CloudRain } from "lucide-react";
import Link from 'next/link';
import { DiscordEvents } from '@/components/discord-events';
import { ImageCarousel } from '@/components/image-carousel';
import Image from 'next/image';

export const revalidate = 300;

const GUILD_ID = '1422806103267344416';
const ftsLogoUrl = "https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2FlogoFTS650bas.jpg?alt=media&token=a8b14c5e-5663-4754-a2fa-149f9636909c";

interface DiscordChannel { id: string; name: string; position: number; type: number; parent_id?: string; }
interface DiscordEvent { id: string; name: string; description: string; scheduled_start_time: string; channel_id: string; }
interface WeatherData { current: { time: string; temperature_2m: number; weather_code: number; }; current_units: { temperature_2m: string; }; }

export default async function DashboardPage() {
  const now = new Date();
  const dateFormatter = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Europe/Paris' });
  const timeFormatter = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short', timeZone: 'Europe/Paris' });

  const currentDate = dateFormatter.format(now);
  const currentTime = timeFormatter.format(now);

  // --- Récupération météo ---
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
      weatherDisplay = `${temp}${unit} à Toulouse`;
      if (code >= 0 && code <= 1) WeatherIcon = Sun;
      else if (code >= 2 && code <= 3) WeatherIcon = Cloud;
      else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) WeatherIcon = CloudRain;
      else WeatherIcon = Cloud;
    }
  } catch (e) { console.error('Erreur météo :', e); }

  const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
  const channelsData: DiscordChannel[] = DISCORD_TOKEN ? await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/channels`, { headers: { Authorization: `Bot ${DISCORD_TOKEN}` }, next: { revalidate: 300 } }).then(res => res.ok ? res.json() : []).catch(() => []) : [];
  const eventsData: DiscordEvent[] = DISCORD_TOKEN ? await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/scheduled-events`, { headers: { Authorization: `Bot ${DISCORD_TOKEN}` }, next: { revalidate: 300 } }).then(res => res.ok ? res.json() : []).catch(() => []) : [];

  // --- Calcul correct du nombre d'événements à venir ---
  const upcomingEventsCount = (eventsData || []).filter(e => Date.parse(e.scheduled_start_time) > Date.now()).length;

  const discordData = { channels: channelsData, events: eventsData };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Logo */}
      <div className="flex justify-center mb-4">
        <Image src={ftsLogoUrl} alt="FTS Logo" width={200} height={200} />
      </div>

      {/* Barre date / heure / météo */}
      <div className="flex justify-between items-center p-4 bg-gray-100 rounded-md mb-6">
        <div>{currentDate}</div>
        <div>{currentTime}</div>
        <div className="flex items-center gap-2">
          <WeatherIcon className="w-6 h-6" />
          {weatherDisplay}
        </div>
      </div>

      {/* Titre Tableau de bord + description */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="text-gray-600">Application communautaire gratuite pour organiser et rejoindre des sorties à Toulouse 🎉</p>
        </div>
      </header>

      {/* Carrousel images */}
      <section className="mb-6">
        <ImageCarousel />
      </section>

      {/* Boutons Discord */}
      <section className="flex flex-wrap justify-center gap-4 mb-6">
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

      {/* Événements à venir */}
      <section className="mb-6">
        <Alert>
          <BellRing className="h-4 w-4" />
          <AlertTitle>Événements à venir</AlertTitle>
          <AlertDescription>
            {upcomingEventsCount > 0 ? (
              <p className="font-bold text-lg text-primary">{upcomingEventsCount} planifiés sur le Discord</p>
            ) : (
              "Aucun événement n'est prévu cette semaine."
            )}
          </AlertDescription>
        </Alert>
      </section>

      {/* Statistiques Discord */}
      <section className="mb-6">
        <DiscordStats data={discordData} />
      </section>

      {/* Tableau des événements et autres composants */}
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
    </div>
  );
}
