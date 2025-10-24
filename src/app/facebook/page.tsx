'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Facebook } from 'lucide-react';

const facebookGroups = [
  { name: "Happy People Toulouse", url: "http://www.facebook.com/groups/6515076697699" },
  { name: "Toulouse Le Bon Plan", url: "http://www.facebook.com/groups/718054099140755" },
  { name: "Toulouse libre ou gratuit", url: "http://www.facebook.com/groups/567884480138156" },
  { name: "Sorties Soirées Toulouse", url: "http://www.facebook.com/groups/172131720757965" },
  { name: "La Carte des Colocs Toulouse", url: "http://www.facebook.com/groups/7391160561172721" },
  { name: "Les Concerts Gratuits de Toulouse", url: "http://www.facebook.com/groups/846721435122" },
  { name: "Sorties culturelles à Toulouse", url: "http://www.facebook.com/groups/35064485113515" },
  { name: "Sorties Visite Toulouse, Occitanie et Région Toulousaine", url: "http://www.facebook.com/groups/274405525650645" },
  { name: "Soirées sorties entre filles Toulouse et Occitanie", url: "http://www.facebook.com/groups/294148708770931" },
  { name: "Aller au théâtre, impro, stand up, spectacles, comédie à Toulouse", url: "http://www.facebook.com/groups/98729730965931" }
];

interface FacebookGroupCardProps {
  name: string;
  url: string;
}

function FacebookGroupCard({ name, url }: FacebookGroupCardProps) {
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
          href={url}
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
            url={group.url}
          />
        ))}
      </div>
    </div>
  );
}
