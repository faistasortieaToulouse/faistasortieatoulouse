'use client';

import { Calendar, Clock, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from './ui/button';

// Constante pour le lien Discord (à vérifier si l'ID est bien le bon)
const GUILD_ID = '1422806103267344416'; 

interface DiscordEvent {
  id: string;
  name: string;
  description: string; // Sera ignorée dans le rendu
  scheduled_start_time: string;
  channel_id: string;
  // Assurez-vous d'avoir le champ de localisation si possible (non présent ici, on utilisera un placeholder)
  entity_metadata?: {
    location?: string;
  };
}

export function DiscordEvents({ events }: { events?: DiscordEvent[] }) {
    
    // Reste la logique de tri
    const sortedEvents = events?.sort((a, b) => new Date(a.scheduled_start_time).getTime() - new Date(b.scheduled_start_time).getTime());

    // 🛑 1. RETIRER LA BALISE <Card> QUI BLOQUE LE DÉFILEMENT PARENT 🛑
    return (
        <div className="space-y-4"> {/* Ce div remplace <CardContent> */}
            <h2 className="text-xl font-bold mb-3 text-primary hidden">Événements Discord à Venir</h2>
            {/* Le titre de la Card est déplacé dans page.tsx pour être au-dessus de l'encart défilant */}

            {sortedEvents && sortedEvents.length > 0 ? (
                <div className="space-y-4">
                    {sortedEvents.map((event) => {
                        
                        const eventLink = `https://discord.com/events/${GUILD_ID}/${event.id}`;
                        // Placeholder pour le lieu puisque 'location' n'est pas dans votre interface actuelle
                        const location = event.entity_metadata?.location || "Salon Discord"; 

                        return (
                            // Utilise un div simple pour chaque événement, sans bordure pour le moment
                            <div key={event.id} className="border-b pb-3 last:border-b-0">
                                
                                {/* Ligne Titre & Bouton Discord */}
                                <div className="flex items-start justify-between">
                                    <h3 className="mb-2 font-semibold text-base leading-snug text-gray-900 dark:text-gray-50 pr-2">{event.name}</h3>
                                    
                                    <Button asChild size="sm" variant="outline" className="h-7 flex-shrink-0">
                                        <a href={eventLink} target="_blank" rel="noopener noreferrer">
                                            Discord
                                            <ExternalLink className="ml-1 h-3 w-3" />
                                        </a>
                                    </Button>
                                </div>
                                
                                {/* DÉTAILS - LIGNE DATE */}
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                    <span>{format(new Date(event.scheduled_start_time), "EEEE d MMMM yyyy", { locale: fr })}</span>
                                </div>
                                
                                {/* DÉTAILS - LIGNE HEURE */}
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <Clock className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                    <span>{format(new Date(event.scheduled_start_time), "HH'h'mm", { locale: fr })}</span>
                                </div>
                                
                                {/* NOUVELLE LIGNE LIEU (simulée ici) */}
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <span className="font-medium text-gray-700 dark:text-gray-300 ml-6 mt-0.5">Lieu:</span>
                                    <span className="mt-0.5">{location}</span>
                                </div>

                                {/* 🛑 DESCRIPTION SUPPRIMÉE (L'ancien bloc 'event.description && ...' n'est plus là) 🛑 */}
                            </div>
                        )
                    })}
                </div>
            ) : (
                <p className="text-muted-foreground p-2">Aucun événement à venir pour le moment.</p>
            )}
        </div>
    );
}
