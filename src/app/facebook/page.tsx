'use client';

import { FacebookGroupCard } from '@/components/facebook-group-card';
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
          <FacebookGroupCard key={group.name} name={group.name} reversedUrl={group.reversedUrl} />
        ))}
      </div>
    </div>
  );
}
