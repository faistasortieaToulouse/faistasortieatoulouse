'use client';

import Link from 'next/link';
import { ChevronLeft, HeartHandshake, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PartenairesPage() {
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

                    {/* Partenaire 1: Happy People 31 */}
                    <div className="bg-background p-4 rounded-lg shadow-sm border flex items-center justify-between">
                        <div>
                            <p className="font-bold text-lg text-primary">Happy People 31</p>
                            <p className="text-sm text-muted-foreground">Communauté d'échange et de sorties conviviales.</p>
                        </div>
                        <Button asChild>
                            <a 
                                href="http://www.happypeople.fr.nf/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center"
                            >
                                Visiter le site
                                <ExternalLink className="h-4 w-4 ml-2" />
                            </a>
                        </Button>
                    </div>
                    
                    {/* Partenaire 2: Bilingue 31 */}
                    <div className="bg-background p-4 rounded-lg shadow-sm border flex items-center justify-between">
                        <div>
                            <p className="font-bold text-lg text-primary">Bilingue 31</p>
                            <p className="text-sm text-muted-foreground">Événements d'échange linguistique et culturel.</p>
                        </div>
                        <Button asChild>
                            <a 
                                href="http://www.bilingue.fr.nf/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center"
                            >
                                Visiter le site
                                <ExternalLink className="h-4 w-4 ml-2" />
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
