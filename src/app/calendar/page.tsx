'use client';

import React, { useState } from 'react';
// Remplacement des imports Next.js par des balises a standards
import { Button } from '@/components/ui/button'; 
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"; 
import { BellRing, Calendar as CalendarIcon, Plus } from "lucide-react";

// --- Définition des types ---
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
                    <h1 className="font-headline text-4xl font-bold text-gray-800 dark:text-gray-100">
                        Calendrier des Sorties
                    </h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                        Organisez vos événements et consultez les prochaines activités de la communauté.
                    </p>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Ajouter un Événement
                </Button>
            </header>

            {/* Alerte pour les événements à venir */}
            <Alert className="border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-950">
                <BellRing className="h-5 w-5 text-purple-600" />
                <AlertTitle className="text-purple-700 dark:text-purple-300">
                    Prochaines Dates Clés
                </AlertTitle>
                <AlertDescription className="text-purple-600 dark:text-purple-400">
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
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-200">
                        <CalendarIcon className="h-6 w-6 text-blue-500" />
                        Vue Mensuelle (Intégration future)
                    </h2>
                    {/* Ceci est un grand bloc visuel pour un futur calendrier */}
                    <div className="h-[400px] w-full bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 text-lg border border-dashed border-gray-300 dark:border-gray-700">
                        <p>Intégration d'un calendrier interactif ici (ex: React Big Calendar)</p>
                    </div>
                </div>

                {/* 2. Liste des événements (Sidebar) */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold mb-2 text-gray-700 dark:text-gray-200">
                        Liste Complète des Sorties
                    </h2>
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-4 border border-gray-100 dark:border-gray-800 max-h-[450px] overflow-y-auto">
                        {mockEvents.map((event) => (
                            <div 
                                key={event.id} 
                                className="mb-3 p-3 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                            >
                                <p className="font-bold text-lg text-blue-600 dark:text-blue-400">{event.title}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
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
