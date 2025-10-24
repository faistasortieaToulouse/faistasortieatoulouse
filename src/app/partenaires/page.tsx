'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, HeartHandshake, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

// --- Utilitaire pour décoder l'URL inversée ---
const decodeUrl = (reversedUrl: string) =>
  reversedUrl.split('').reverse().join('');

interface Partenaire {
  name: string;
  description: string;
  reversedUrl: string;
  imageUrl: string;
}

export default function PartenairesPage() {
  const handleVisit = useCallback((reversedUrl: string) => {
    const url = decodeUrl(reversedUrl);
    // URL complète avec www conservé
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  }, []);

  const partenaires: Partenaire[] = [
    {
      name: 'Happy People 31',
      description: 'Communauté d\'échange et de sorties conviviales.',
      reversedUrl: 'fn.www.elpoepyppah.moc//:sptth',
      imageUrl: 'https://secure.meetupstatic.com/photos/event/4/f/d/b/clean_522560443.webp',
    },
    {
      name: 'Bilingue 31',
      description: 'Événements d\'échange linguistique et culturel.',
      reversedUrl: 'fn.www.eugnilib.moc//:sptth',
      imageUrl: 'https://secure.meetupstatic.com/photos/event/6/a/7/1/clean_513687249.webp',
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {partenaires.map((partenaire) => (
            <Card key={partenaire.name} className="flex flex-col items-center">
              <CardHeader className="text-center">
                <CardTitle>{partenaire.name}</CardTitle>
                <CardDescription>{partenaire.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col items-center">
                {/* Image cliquable, taille réduite mais conservée */}
                <div
                  className="w-48 h-48 mb-4 cursor-pointer"
                  onClick={() => handleVisit(partenaire.reversedUrl)}
                >
                  <Image
                    src={partenaire.imageUrl}
                    alt={`Image pour ${partenaire.name}`}
                    width={192}
                    height={192}
                    style={{ objectFit: 'contain' }}
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={() => handleVisit(partenaire.reversedUrl)}
                  className="w-full flex justify-center"
                >
                  <div className="flex items-center">
                    Visiter le site
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </div>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
