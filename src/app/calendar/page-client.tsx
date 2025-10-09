'use client';

import { useState } from 'react';
// Importation nécessaire pour la locale française du calendrier
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Plus, BellRing, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar'; 

// Définitions de type pour les événements Discord
interface DiscordEvent {
    id: string;
    name: string;
    scheduled_start_time: string; // Utilise le nom de la propriété Discord
    description?: string;
}

// Props attendues du composant Serveur
interface CalendarClientProps {
    eventsData: DiscordEvent[]; // Tous les événements (passés et futurs)
    upcomingEvents: DiscordEvent[]; // Événements futurs, déjà triés (pour l'alerte)
}

// --- Fonction de formatage de date ---
const formatEventTime = (isoString: string) => {
    const date = new Date(isoString);
    // Utilisation de fr-FR pour le formatage standard du texte
    return new Intl.DateTimeFormat('fr-FR', { 
        day: 'numeric', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
    }).format(date);
};

export default function CalendarClient({ eventsData, upcomingEvents }: CalendarClientProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    
    // Convertir les événements Discord en objets Date pour marquer les jours dans le calendrier
    // SAFEGUARD: Utilise (eventsData || []) pour garantir que .map est appelé sur un tableau
    const eventDays = (eventsData || []).map(event => new Date(event.scheduled_start_time));

    // Liste complète des événements triés par ordre chronologique
    // SAFEGUARD: Utilise (eventsData || []).slice() pour trier une copie sûre de l'array
    const allSortedEvents = (eventsData || []).slice().sort((a, b) => new Date(a.scheduled_start_time).getTime() - new Date(b.scheduled_start_time).getTime());

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="font-headline text-4xl font-bold text-primary">
                        Calendrier des Sorties
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Organisez vos événements et consultez les prochaines activités de la communauté.
                    </p>
                </div>
                {/* CORRECTION 1: Ajout du lien vers le serveur Discord en utilisant 'asChild' sur le Button */}
                <Button asChild>
                    <a 
                        href="https://discord.com/channels/1422806103267344416/1422806103904882842" 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Ajouter un Événement
                    </a>
                </Button>
            </header>

            {/* Alerte pour les événements à venir */}
            <Alert className="border-l-4 border-primary">
                <BellRing className="h-5 w-5 text-primary" />
                <AlertTitle className="text-primary">
                    Prochaines Dates Clés
                </AlertTitle>
                <AlertDescription>
                    {/* upcomingEvents est garanti d'être un tableau par le composant serveur */}
                    {upcomingEvents.length > 0 && upcomingEvents[0] ? (
                        <p>
                            **{upcomingEvents.length}** événements Discord prévus. Le prochain est : **{upcomingEvents[0].name}** le {formatEventTime(upcomingEvents[0].scheduled_start_time)}.
                        </p>
                    ) : (
                        'Aucun événement n’est prévu pour le moment. Soyez le premier à en organiser un !'
                    )}
                </AlertDescription>
            </Alert>

            {/* Zone principale du calendrier (Structure Grid) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1. Calendrier Interactif */}
                <div className="lg:col-span-2 bg-card p-6 rounded-xl shadow-lg border flex flex-col items-center">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-card-foreground">
                        <CalendarIcon className="h-6 w-6 text-primary" />
                        Vue Mensuelle des Événements
                    </h2>
                    
                    {/* Intégration du composant Calendar */}
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        locale={fr} // <-- PASSAGE DE L'OBJET LOCALE IMPORTÉ
                        modifiers={{
                            eventDay: eventDays, 
                        }}
                        modifiersClassNames={{
                            // CORRECTION 2: Forcer une couleur foncée (gris 900) pour les chiffres du calendrier
                            day: 'text-gray-900', 
                            eventDay: 'bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors', 
                        }}
                        className="rounded-xl border shadow"
                    />
                </div>

                {/* 2. Liste des événements (Sidebar) */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold mb-2 text-card-foreground">
                        Liste Complète des Sorties
                    </h2>
                    <div className="bg-card rounded-xl shadow-lg p-4 border max-h-[600px] overflow-y-auto">
                        {allSortedEvents.map((event) => (
                            <div 
                                key={event.id} 
                                className="mb-3 p-3 border-b last:border-b-0 hover:bg-secondary/50 rounded-md transition-colors"
                            >
                                <p className="font-bold text-lg text-primary">{event.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {formatEventTime(event.scheduled_start_time)}
                                </p>
                            </div>
                        ))}
                        {allSortedEvents.length === 0 && (
                             <p className="text-muted-foreground text-center py-4">
                                Aucun événement Discord trouvé.
                             </p>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
