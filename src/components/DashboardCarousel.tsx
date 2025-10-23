import DashboardClient from '@/components/DashboardClient';
import { CarouselImage, DiscordChannel, DiscordEvent } from '@/types/types';

// --- Constantes globales ---
const GUILD_ID = '1422806103267344416';
const POLLS_CHANNEL_ID = '1422806103904882842';
const FTS_LOGO_URL =
  'https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2FlogoFTS650bas.jpg?alt=media&token=a8b14c5e-5663-4754-a2fa-149f9636909c';

// --- Liste complète des images du carrousel ---
const CAROUSEL_IMAGES: string[] = [
  'https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2Fftsbar600.jpg?alt=media&token=9b43bcb8-c50c-444d-a065-11e2e85fdf99',
  'https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2Fftsbaton600.jpg?alt=media&token=04b6691b-d7b2-406f-965a-549dd6661b2a',
  'https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2Fftscinema600.jpg?alt=media&token=a84866fb-feb9-4d0c-9eb6-ac731587eaef',
  'https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2Fftsconcert600.jpg?alt=media&token=c8a60141-ce60-4e06-a57c-ba074c75be6e',
  'https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2Fftscovoiturage600.jpg?alt=media&token=9ee65071-322b-431d-b17f-d7615179eaa0',
  'https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2Fftsdanse600.jpg?alt=media&token=929ae89b-06ad-40ce-a80f-490d962b55d0',
  'https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2Fftsemploi600.jpg?alt=media&token=711a3be0-1819-42d6-815e-e261e5141c3f',
  'https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2Fftsjeu600.jpg?alt=media&token=bb145e71-8bd8-4a35-b7ae-4612e4847f24',
  'https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2Fftslecture600.jpg?alt=media&token=0affb0af-d125-4d43-896c-4eaa28abc485',
  'https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2Fftslogement600.jpg?alt=media&token=0b505d21-c149-4737-8036-76e601893a75',
  'https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2Fftsmusee600.jpg?alt=media&token=3acf3cf7-03e8-41e9-a597-115c7571ba05',
  'https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2Fftspeinture600.jpg?alt=media&token=af76080e-80a6-4321-ad93-10bc0508e5a4',
  'https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2Fftsphoto600.jpg?alt=media&token=8288cf54-0765-4fb8-8140-ab5661131536',
  'https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2Fftspiquenique600.jpg?alt=media&token=8ffeada9-140b-45c4-9086-74c2d7139597',
  'https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2Fftsplage600.jpg?alt=media&token=cf738791-9410-45db-94df-33d2baaf2bd9',
  'https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2Fftsrando600.jpg?alt=media&token=1d74e737-9ea9-49cb-a81f-e2e406a5641c',
  'https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2Fftsrestaurant600.jpg?alt=media&token=b822b9f2-07dc-47b3-882f-ae94db15646b',
  'https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2Fftssalondethe600.jpg?alt=media&token=261fcdb0-fe9e-4a37-b19a-7c33d0ed692e',
  'https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2Fftstehatre600.jpg?alt=media&token=d92f608d-a6ae-4e32-8b5c-46d8f6b9313b',
  'https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2Fftsyoga600.jpg?alt=media&token=b94b5c9a-2d7f-4048-8ea6-7fc26add1c65',
  'https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2Fftszumba600.jpg?alt=media&token=86c38701-02ee-4ab1-8ae7-6cf94480966e',
];

// --- Interface pour les données du widget Discord ---
interface DiscordWidgetData {
  channels?: DiscordChannel[];
  events?: DiscordEvent[];
  images?: CarouselImage[];
  guildId?: string;
}

// --- Composant principal ---
export default function DashboardCarousel() {
  const widgetData: DiscordWidgetData = {
    channels: [],
    events: [],
    images: CAROUSEL_IMAGES.map((url) => ({ url } as CarouselImage)),
    guildId: GUILD_ID,
  };

  return <DashboardClient {...widgetData} logoUrl={FTS_LOGO_URL} pollsChannelId={POLLS_CHANNEL_ID} />;
}
