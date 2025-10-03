import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LegalPage() {
  return (
    <div className="p-4 md:p-8">
      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold text-primary">Mentions Légales</h1>
        <p className="mt-2 text-muted-foreground">
          Informations légales concernant Tolosa.
        </p>
      </header>

      <div className="space-y-6 text-card-foreground">
        <Card>
          <CardHeader>
            <CardTitle>Éditeur du site</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Association Happy People 31</p>
            <p>13, bd Lascrosses</p>
            <p>31000 Toulouse</p>
            <p>France</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Directeur de la publication</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Le représentant légal de l'association Happy People 31.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Pour toute question, vous pouvez nous contacter à l'adresse email suivante : tolosa31@free.fr.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hébergeur du site</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Ce site est hébergé par Firebase, un service de Google LLC.</p>
            <p>Google LLC</p>
            <p>1600 Amphitheatre Parkway</p>
            <p>Mountain View, CA 94043, USA</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Propriété intellectuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <p>L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Données personnelles</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Les informations recueillies font l'objet d'un traitement informatique destiné à la gestion des comptes utilisateurs et à la mise en relation des membres. Conformément à la loi "informatique et libertés" du 6 janvier 1978 modifiée, vous bénéficiez d'un droit d'accès et de rectification aux informations qui vous concernent, que vous pouvez exercer en nous contactant à l'adresse email mentionnée ci-dessus.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Responsabilité</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Tolosa Amical met tout en œuvre pour offrir aux utilisateurs des informations et/ou des outils disponibles et vérifiés mais ne saurait être tenu pour responsable des erreurs, d'une absence de disponibilité des fonctionnalités ou de la présence de virus sur son site. Les événements et annonces sont publiés sous la seule responsabilité de leurs auteurs.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
