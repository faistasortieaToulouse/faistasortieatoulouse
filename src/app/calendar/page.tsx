'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Plus, BellRing, Calendar as CalendarIcon } from 'lucide-react';

interface Event {
    id: number;
    title: string;
    date: string; // Format ISO 8601 (e.g., "2025-10-05T10:00:00")
    location: string;
}

// --- Données factices ---
const mockEvents: Event[] = [
    { id: 1, title: 'Soirée Jeux de Société', date: '2025-10-12T19:30:00', location: 'Bar Le Zénith' },
    { id: 2, title: 'Randonnée Montagne', date: '2025-10-19T08:00:00', location: 'Départ Parking C' },
    { id: 3, title: 'Cinéma - Sortie du Film X', date: '2025-10-25T20:00:00', location: 'Ciné Cité' },
    { id: 4, title: 'Pot de rentrée Devs', date: '2025-10-28T18:30:00', location: 'Espace Coworking' },
];

// --- Fonction de formatage de date ---
const formatEventTime = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('fr-FR', { 
        day: 'numeric', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
    }).format(date);
};

export default function CalendarPage() {
    // État pour gérer la date sélectionnée (utile pour un futur calendrier)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    
    // Filtre les événements à venir (simulés)
    const upcomingEvents = mockEvents.filter(event => new Date(event.date) > new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
                <Button>
                    <Plus className="h-5 w-5 mr-2" />
                    Ajouter un Événement
                </Button>
            </header>

            {/* Alerte pour les événements à venir */}
            <Alert className="border-l-4 border-primary">
                <BellRing className="h-5 w-5 text-primary" />
                <AlertTitle className="text-primary">
                    Prochaines Dates Clés
                </AlertTitle>
                <AlertDescription>
                    {upcomingEvents.length > 0 ? (
                        <p>
                            **{upcomingEvents.length}** événements prévus. Le prochain est : **{upcomingEvents[0].title}** le {formatEventTime(upcomingEvents[0].date)}.
                        </p>
                    ) : (
                        'Aucun événement n’est prévu pour le moment. Soyez le premier à en organiser un !'
                    )}
                </AlertDescription>
            </Alert>

            {/* Zone principale du calendrier (Structure Grid) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1. Calendrier (Placeholder) */}
                <div className="lg:col-span-2 bg-card p-6 rounded-xl shadow-lg border">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-card-foreground">
                        <CalendarIcon className="h-6 w-6 text-primary" />
                        Vue Mensuelle (Intégration future)
                    </h2>
                    {/* Ceci est un grand bloc visuel pour un futur calendrier */}
                    <div className="h-[400px] w-full bg-background rounded-lg flex items-center justify-center text-muted-foreground text-lg border border-dashed">
                        <p>Intégration d'un calendrier interactif ici</p>
                    </div>
                </div>

                {/* 2. Liste des événements (Sidebar) */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold mb-2 text-card-foreground">
                        Liste Complète des Sorties
                    </h2>
                    <div className="bg-card rounded-xl shadow-lg p-4 border max-h-[450px] overflow-y-auto">
                        {mockEvents.map((event) => (
                            <div 
                                key={event.id} 
                                className="mb-3 p-3 border-b last:border-b-0 hover:bg-secondary/50 rounded-md transition-colors"
                            >
                                <p className="font-bold text-lg text-primary">{event.title}</p>
                                <p className="text-sm text-muted-foreground">
                                    {formatEventTime(event.date)} - {event.location}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}
