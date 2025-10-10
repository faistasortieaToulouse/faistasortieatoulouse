'use client';

import Link from 'next/link';
import { ChevronLeft, Zap, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrganiserSortiesPage() {
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
                    <Zap className="h-7 w-7" />
                    Organise tes Sorties
                </h1>
                <p className="mb-8 text-muted-foreground max-w-2xl">
                    Des outils et des idées pour t'aider à organiser tes propres événements ou trouver l'inspiration.
                </p>

                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-card-foreground border-b pb-2">
                        Ressources d'Inspiration et d'Organisation
                    </h2>

                    {/* Premier Lien : clutchmag.org */}
                    <div className="bg-background p-4 rounded-lg shadow-sm border flex items-center justify-between">
                        <div>
                            <p className="font-bold text-lg text-primary">Clutch Mag</p>
                            <p className="text-sm text-muted-foreground">Actualités, événements et culture à Toulouse.</p>
                        </div>
                        <Button asChild>
                            <a 
                                href="https://clutchmag.org" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center"
                            >
                                Visiter le site
                                <ExternalLink className="h-4 w-4 ml-2" />
                            </a>
                        </Button>
                    </div>

                    {/* Vous pouvez ajouter d'autres liens ici si nécessaire */}
                </div>
            </div>
        </div>
    );
}
