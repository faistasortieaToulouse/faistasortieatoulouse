'use client';

import React from 'react';
import { Bus, Bike, Car, MapPin, Link as LinkIcon, AlertTriangle } from 'lucide-react';
// import Link from 'next/link'; // Retiré car non utilisé ici

// Ce composant représente la page de Mobilité/Déplacements à Toulouse
export default function MobilityPage() {

    // Liens vers les services de mobilité officiels
    const mobilityServices = [
        { 
            name: "Tisséo (Bus, Métro, Tram)", 
            url: "https://www.tisseo.fr/", 
            description: "Horaires, lignes et état du réseau en temps réel.", 
            icon: Bus,
            color: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
            iconColor: "text-indigo-600"
        },
        { 
            name: "VélÔ Toulouse (Disponibilité)", 
            url: "https://velotoulouse.tisseo.fr/", 
            description: "Stations, vélos disponibles et places libres.", 
            icon: Bike,
            color: "bg-green-50 border-green-200 hover:bg-green-100",
            iconColor: "text-green-600"
        },
        { 
            name: "Covoiturage (Covoitéo par Karos)", 
            url: "https://plan-interactif.tisseo.fr/covoiturage", 
            description: "Recherchez vos trajets quotidiens via le partenaire officiel Tisséo.", 
            icon: Car,
            color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
            iconColor: "text-purple-600"
        },
    ];

    // Lien vers l'information trafic routier
    const trafficLink = {
        name: "Toulouse Trafic (Trafic Routier)",
        url: "https://toulousetrafic.com/",
        description: "Visualisation rapide des conditions de circulation et des travaux.",
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            <header className="border-b pb-4">
                <h1 className="text-4xl font-extrabold text-gray-900 flex items-center">
                    <MapPin className="w-8 h-8 mr-3 text-red-600" />
                    Déplacements & Mobilité à Toulouse
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                    Accès rapide aux ressources clés pour planifier vos trajets en transports en commun, vélo, ou voiture.
                </p>
            </header>

            {/* Section des Services de Mobilité (Bus, Vélo, Covoiturage) */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Transports Tisséo & Alternatives</h2>
                
                <div className="grid md:grid-cols-3 gap-6">
                    {mobilityServices.map((service) => (
                        <a 
                            key={service.url}
                            href={service.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex flex-col items-start p-6 rounded-xl shadow-lg transition duration-200 border-2 ${service.color}`}
                        >
                            <service.icon className={`w-8 h-8 mb-3 ${service.iconColor}`} />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                            <p className="text-sm text-gray-700 flex-grow">{service.description}</p>
                            <span className="mt-4 text-sm font-medium flex items-center">
                                <LinkIcon className="w-4 h-4 mr-1" /> Visiter le site
                            </span>
                        </a>
                    ))}
                </div>
            </section>

            {/* Section Trafic Routier */}
            <section className="space-y-4 pt-4 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">Trafic Routier</h2>
                <div className="bg-white p-6 rounded-xl shadow-lg border border-red-200">
                    <a 
                        href={trafficLink.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2"
                    >
                        <div className="flex items-center">
                            <AlertTriangle className="w-6 h-6 mr-3 text-red-600" />
                            <div>
                                <h3 className="text-xl font-semibold text-red-800">{trafficLink.name}</h3>
                                <p className="text-sm text-gray-700">{trafficLink.description}</p>
                            </div>
                        </div>
                        <LinkIcon className="w-5 h-5 text-red-600" />
                    </a>
                    
                    {/* Note pour l'intégration future */}
                    <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-800 rounded">
                        <p className="text-sm font-medium">
                            **Note d'intégration :** Pour afficher le trafic en direct (cartes, retards), il est recommandé d'utiliser l'API Google Maps ou d'une autre plateforme de données ouvertes.
                        </p>
                    </div>
                </div>
            </section>

        </div>
    );
}
