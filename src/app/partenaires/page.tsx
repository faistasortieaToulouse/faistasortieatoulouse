'use client';

import Link from 'next/link';
import { ChevronLeft, HeartHandshake, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCallback } from 'react';

// --- Utilitaire pour décoder l'URL inversée ---
const decodeUrl = (reversedUrl: string) =>
  reversedUrl.split('').reverse().join('');

export default function PartenairesPage() {
    const handleVisit = useCallback((reversedUrl: string) => {
        const url = decodeUrl(reversedUrl);
        window.open(url, '_blank', 'noopener,noreferrer');
    }, []);

    const partenaires = [
        {
            name: 'Happy People 31',
            description: 'Communauté d\'échange et de sorties conviviales.',
            reversedUrl: 'f./fn.rf.elpoepyppah.www//:sptth',
        },
        {
            name: 'Bilingue 31',
            description: 'Événements d\'échange linguistique et culturel.',
            reversedUrl: 'f./fn.rf.eugnilib.www//:sptth',
        }
    ];

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8">
            <header className="flex justify-between items-center">
                <Button asChild variant="ghost" className="text-muted-foreground hover:text-primary">
                    <Link href="/">
                        <ChevronLeft className="h-5 w-5 mr-2" />
                        Retour au Tableau de Bord
                    </Link>
                </Button>
            </header>

            <div className="bg-card p-8 rounded-xl shadow-lg border">
                <h1 className="font-headline text-4xl font-bold text-primary mb-4 flex items-center gap-3">
                    <HeartHandshake className="h-7 w-7" />
                    Nos Partenaires
                </h1>
                <p className="mb-8 text-muted-foreground max-w-2xl">
                    Découvrez les associations et les communautés qui soutiennent notre mission à Toulouse.
                </p>

                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-card-foreground border-b pb-2">
                        Réseaux Amicaux et Linguistiques
                    </h2>

                    {partenaires.map((partenaire) => (
                        <div
                            key={partenaire.name}
                            className="bg-background p-4 rounded-lg shadow-sm border flex items-center justify-between"
                        >
                            <div>
                                <p className="font-bold text-lg text-primary">{partenaire.name}</p>
                                <p className="text-sm text-muted-foreground">{partenaire.description}</p>
                            </div>
                            <Button onClick={() => handleVisit(partenaire.reversedUrl)}>
                                <div className="flex items-center">
                                    Visiter le site
                                    <ExternalLink className="h-4 w-4 ml-2" />
                                </div>
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
