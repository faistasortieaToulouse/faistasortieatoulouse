'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Facebook } from 'lucide-react';

const facebookGroups = [
  { name: "Happy People Toulouse", reversedUrl: "/033150766697699/spuorg/moc.koobecaf.www//:sptth" },
  { name: "Toulouse Le Bon Plan", reversedUrl: "/718054099140755/spuorg/moc.koobecaf.www//:sptth" },
  { name: "Toulouse libre ou gratuit", reversedUrl: "/567884480138156/spuorg/moc.koobecaf.www//:sptth" },
  { name: "Sorties Soirées Toulouse", reversedUrl: "/172131720757965/spuorg/moc.koobecaf.www//:sptth" },
  { name: "La Carte des Colocs Toulouse", reversedUrl: "/7391160561172721/spuorg/moc.koobecaf.www//:sptth" },
  { name: "Les Concerts Gratuits de Toulouse", reversedUrl: "/846721435122/spuorg/moc.koobecaf.www//:sptth" },
  { name: "sorties culturelles à Toulouse", reversedUrl: "/35064485113515/spuorg/moc.koobecaf.www//:sptth" },
  { name: "Sorties Visite Toulouse, Occitanie et Région Toulousaine", reversedUrl: "/274405525650645/spuorg/moc.koobecaf.www//:sptth" },
  { name: "Soirées sorties entre filles Toulouse et Occitanie", reversedUrl: "/294148708770931/spuorg/moc.koobecaf.www//:sptth" },
  { name: "aller au théâtre, impro, stand up, spectacles, comédie à Toulouse", reversedUrl: "/098729730965931/spuorg/moc.koobecaf.www//:sptth" }
];

// Fonction pour inverser et forcer http://www.
const decodeFacebookUrl = (reversedUrl: string) => {
  let url = reversedUrl.replace(/^\/+|\/+$/g, '').split('').reverse().join('');
  
  // Forcer http://
  if (!/^https?:\/\//.test(url)) url = 'http://' + url;
  
  try {
    const u = new URL(url);
    if (!u.hostname.startsWith('www.')) u.hostname = 'www.' + u.hostname;
    u.protocol = 'http:';
    return u.toString();
  } catch {
    let fallback = url;
    if (!/^https?:\/\//.test(fallback)) fallback = 'http://' + fallback;
    if (!fallback.includes('www.')) fallback = fallback.replace(/^http:\/\//, 'http://www.');
    return fallback;
  }
};

interface FacebookGroupCardProps {
  name: string;
  reversedUrl: string;
}

function FacebookGroupCard({ name, reversedUrl }: FacebookGroupCardProps) {
  const facebookUrl = decodeFacebookUrl(reversedUrl);

  return (
    <Card className="flex flex-col items-center justify-between p-4">
      <CardHeader className="text-center">
        <CardTitle className="text-lg font-semibold flex items-center justify-center gap-2">
          <Facebook className="h-5 w-5 text-blue-600" />
          {name}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-blue-600 font-medium hover:underline"
        >
          Voir le groupe sur Facebook
        </a>
      </CardContent>
    </Card>
  );
}

export default function FacebookGroupsPage() {
  return (
    <div className="p-4 md:p-8">
      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold text-primary">Groupes Facebook</h1>
        <p className="mt-2 text-muted-foreground">
          Les meilleurs groupes Facebook pour les sorties et bons plans à Toulouse.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {facebookGroups.map((group) => (
          <FacebookGroupCard
            key={group.name}
            name={group.name}
            reversedUrl={group.reversedUrl}
          />
        ))}
      </div>
    </div>
  );
}
