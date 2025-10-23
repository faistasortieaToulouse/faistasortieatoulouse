// src/types/types.ts

export interface CarouselImage {
  id: string;
  imageUrl: string;
  description: string;
  imageHint?: string;
}

export interface DiscordChannel {
  id: string;
  name: string;
  position: number;
  type: number;
  parent_id?: string;
}

export interface DiscordEvent {
  id: string;
  name: string;
  description: string;
  scheduled_start_time: string;
  channel_id: string;
  entity_metadata?: {
    location?: string; // <-- ici on ajoute le lieu
  };
}

// --- Nouveau type pour DashboardClient ---
export interface DiscordWidgetData {
  channels: DiscordChannel[];
  events: DiscordEvent[];
  images: CarouselImage[];
  guildId: string;
}

// Tu peux ajouter d’autres types partagés ici...
