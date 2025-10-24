'use client';

import Link from 'next/link';
import { ChevronLeft, HeartHandshake, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

// --- Fonction pour décoder les URL inversées ---
const decodeUrl = (reversedUrl: string) => {
  const url = reversedUrl.split('').reverse().join('');
  // Si l’URL commence par https:// mais pas avec www., on l’ajoute
  if (url.startsWith('https://') && !url.startsWith('https://www.')) {
    return url.replace('https://', 'https://www.');
  }
  return url;
};

interface Partenaire {
  name: string;
  description: string;
  reversedUrl: string;
}

export default function PartenairesPage() {
  const handleVisit = useCallback((reversedUrl: string) => {
    const url = decodeUrl(reversedUrl);
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const partenaires: Partenaire[] = [
    {
      name: 'Happy People 31',
      description: 'Communauté d’échange et de sorties conviviales.',
      reversedUrl: '/fn.rf.elpoepyppah.www//:sptth', // inversé exact avec www
    },
    {
      name: 'Bilingue 31',
      description: 'Événements d’échange linguistique et culturel.',
      reversedUrl: '/fn.rf.eugnilib.www//:sptth', // inversé exact avec www
    },
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {partenaires.map((partenaire) => (
            <Card key={partenaire.name} className="flex flex-col items-center text-center">
              <CardHeader>
                <CardTitle className="text-primary">{partenaire.name}</CardTitle>
                <CardDescription>{partenaire.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <Button
                  onClick={() => handleVisit(partenaire.reversedUrl)}
                  variant="outline"
                  className="mt-2"
                >
                  Voir le site
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
