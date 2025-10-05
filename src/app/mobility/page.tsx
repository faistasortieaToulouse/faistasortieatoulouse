import React from 'react';
import { Bus, Car, Bike, ChevronRight, MapPin, ExternalLink, CalendarDays, Zap } from "lucide-react";
// Les imports Button, Card, CardHeader, CardContent, etc. seraient nécessaires ici,
// mais pour assurer la compilation, nous utiliserons des divs stylisés Tailwind.

/**
 * Composant réutilisable pour une carte d'information ou de lien.
 */
const InfoCard = ({ icon: Icon, title, description, children, className = '' }) => (
    <div className={`p-6 border border-gray-200 rounded-xl shadow-lg bg-white transition-all hover:shadow-xl ${className}`}>
        <div className="flex items-start mb-4">
            <div className="p-3 mr-4 rounded-full bg-violet-100 text-[#A020F0]">
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
        </div>
        <div className="mt-4 space-y-3">
            {children}
        </div>
    </div>
);

/**
 * Composant réutilisable pour un lien externe dans une carte.
 */
const CardLink = ({ href, text }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between text-violet-600 hover:text-[#A020F0] hover:underline transition-colors text-sm"
    >
        <span>{text}</span>
        <ExternalLink className="h-4 w-4 ml-2" />
    </a>
);


/**
 * Page d'accueil pour la section Mobilité.
 * Affiche les liens statiques et les informations de base sur les transports.
 */
export default function MobilityHomePage() {
    return (
        <div className="p-4 md:p-8 space-y-8">
            <header className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900">Liens Mobilité Toulouse</h1>
                <p className="mt-2 text-gray-600">
                    Retrouvez les ressources essentielles pour vous déplacer dans la métropole : bus, métro, covoiturage et vélos.
                </p>
            </header>

            {/* Grid 2x2 pour les grandes vues, 1 colonne pour les mobiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Section 1 : Tisséo (Bus & Métro) */}
                <InfoCard
                    icon={Bus}
                    title="Transports en Commun (Tisséo)"
                    description="Informations officielles sur les lignes, tarifs et perturbations."
                >
                    <CardLink
                        href="https://www.tisseo.fr/"
                        text="Site Officiel Tisséo"
                    />
                    <CardLink
                        href="https://www.tisseo.fr/se-deplacer/plans-lignes"
                        text="Plans du Réseau (Métro, Tram, Bus)"
                    />
                    <CardLink
                        href="https://www.tisseo.fr/tarifs-titres/tarifs-par-profil"
                        text="Tarifs et Abonnements"
                    />
                    <CardLink
                        href="https://www.tisseo.fr/infos-pratiques/perturbations-reseau"
                        text="Consulter les Perturbations"
                    />
                </InfoCard>

                {/* Section 2 : Covoiturage */}
                <InfoCard
                    icon={Car}
                    title="Covoiturage Métropolitain"
                    description="Partagez vos trajets quotidiens pour économiser et réduire l'empreinte carbone."
                >
                    <CardLink
                        href="https://covoiturage.haute-garonne.fr/"
                        text="Covoiturage Haute-Garonne"
                    />
                    <CardLink
                        href="https://www.blablacar.fr/trajet/toulouse"
                        text="BlaBlaCar (Longues Distances)"
                    />
                    <CardLink
                        href="https://tisseo.moncovoit.fr/"
                        text="Covoiturage Tisséo"
                    />
                </InfoCard>

                {/* Section 3 : Vélo & Mobilités Douces */}
                <InfoCard
                    icon={Bike}
                    title="Mobilités Douces"
                    description="Vélos en libre-service, pistes cyclables et aides à l'achat."
                >
                    <CardLink
                        href="https://www.velotoulouse.fr/"
                        text="VélôToulouse (Vélo en Libre-Service)"
                    />
                    <CardLink
                        href="https://www.toulouse.fr/web/deplacements/velos/le-reseau-cyclable"
                        text="Plan des Pistes Cyclables"
                    />
                    <CardLink
                        href="https://www.toulouse-metropole.fr/aides-subventions/mobilite"
                        text="Aides à l'Achat de Vélo"
                    />
                </InfoCard>
                
                {/* Section 4 : Infos Trafic & Routes (Ajouté) */}
                <InfoCard
                    icon={Zap}
                    title="Infos Trafic & Routes"
                    description="Consultez l'état du trafic en temps réel pour vos déplacements en voiture."
                >
                    <CardLink
                        href="https://toulousetrafic.com/"
                        text="Toulouse Trafic (État des Routes)"
                    />
                    <CardLink
                        href="https://www.waze.com/live-map/carpool?lat=43.6047&lon=1.4442&zoom=14"
                        text="Carte du Trafic Waze"
                    />
                </InfoCard>


            </div>

            {/* Section supplémentaire pour la Map (promouvoir l'onglet suivant) */}
            <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-violet-50 rounded-lg shadow-inner">
                    <div className="flex items-center space-x-3 mb-4 md:mb-0">
                        <MapPin className="h-6 w-6 text-[#A020F0]" />
                        <span className="text-lg font-semibold text-gray-700">
                            Préparez vos trajets avec l'outil de carte
                        </span>
                    </div>
                    {/* Lien vers l'onglet Map. J'utilise <a> car Link n'est pas résolu */}
                    <a
                        href="/mobility/map"
                        className="flex items-center text-violet-600 hover:text-[#A020F0] font-medium transition-colors"
                    >
                        Accéder à la Carte Interactive
                        <ChevronRight className="h-4 w-4 ml-2" />
                    </a>
                </div>
            </div>
        </div>
    );
}
