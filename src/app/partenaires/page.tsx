'use client';

import Link from 'next/link';
import { ChevronLeft, HeartHandshake, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

// --- Fonction robuste pour décoder l'URL inversée et forcer www ---
const decodeUrl = (reversedUrl: string) => {
  // 1) nettoyer les / initiaux éventuels
  const cleanReversed = reversedUrl.replace(/^\/+/, '');

  // 2) inverser caractère par caractère
  let decoded = cleanReversed.split('').reverse().join('');

  // 3) s'assurer d'un protocole pour que new URL fonctionne
  if (!/^https?:\/\//i.test(decoded)) {
    decoded = 'https://' + decoded;
  }

  // 4) parser et forcer 'www.' sur hostname
  try {
    const u = new URL(decoded);

    // si le hostname ne commence pas par www., on le préfixe
    if (!u.hostname.startsWith('www.')) {
      u.hostname = 'www.' + u.hostname;
    }

    // s'assurer qu'il y a bien un slash final (optionnel)
    const final = u.toString();
    // DEBUG — retire en production si tu veux
    // console.log('decodeUrl:', { reversedUrl, cleanReversed, decoded, final });
    return final;
  } catch (err) {
    // fallback simple si parsing échoue : tenter un ajout basique
    let fallback = decoded;
    if (!/^https?:\/\//i.test(fallback)) fallback = 'https://' + fallback;
    if (!fallback.includes('www.')) fallback = fallback.replace(/^https:\/\//i, 'https://www.');
    return fallback;
  }
};

interface Partenaire {
  name: string;
  description: string;
  reversedUrl: string;
}

export default function PartenairesPage() {
  const handleVisit = useCallback((reversedUrl: string) => {
    const url = decodeUrl(reversedUrl);
    // debug temporaire
    console.log('Ouverture URL:', url);
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const partenaires: Partenaire[] = [
    {
      name: 'Happy People 31',
      description: 'Communauté d’échange et de sorties conviviales.',
      // NOTE : tu peux garder ou enlever le slash initial, decodeUrl gère les deux
      reversedUrl: '/fn.rf.elpoepyppah.www//:sptth', // inverse exact de "https://www.happypeople.fr.nf/"
    },
    {
      name: 'Bilingue 31',
      description: 'Événements d’échange linguistique et culturel.',
      reversedUrl: '/fn.rf.eugnilib.www//:sptth', // inverse exact de "https://www.bilingue.fr.nf/"
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
