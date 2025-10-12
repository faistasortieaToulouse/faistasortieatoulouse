'use client';

import Link from 'next/link';
import { ChevronLeft, Zap, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import checkResults from '@/lib/checkUrlsResults.json';

// Structure des catégories et des liens
const categories = [
  {
    title: "Événements des établissements privés gratuits et payants",
    links: [
      "https://www.toulousebouge.com",
      "https://www.clutchmag.fr/evenements",
      "https://www.lepetittou.com/activite/culture/",
      "https://31.agendaculturel.fr/agenda-culturel/toulouse/",
      "https://toulousesecret.com/culture/page/8/",
      "https://www.jds.fr/toulouse/agenda/",
      "https://www.alentoor.fr/toulouse/agenda",
      "https://www.cityzeum.com/evenement/toulouse",
      "https://toulouse.latribune.fr/evenements.html",
      "https://www.lafrenchtechtoulouse.com/open-agenda/",
    ],
  },
  {
    title: "Événements des établissements publics gratuits",
    links: [
      "https://bibliotheque.toulouse.fr/agenda",
      "https://agenda.toulouse-metropole.fr/",
      "https://www.toulouse-tourisme.com/agenda",
      "https://www.hautegaronnetourisme.com/bouger-et-sortir/sortir-se-divertir/tout-agenda/",
      "https://cpieterrestoulousaines.org/agenda/",
      "https://www.culture.gouv.fr/Regions/Drac-Occitanie",
      "https://openagenda.com/toulouse-metropole",
    ],
  },
  {
    title: "Événements alternatifs gratuits",
    links: [
      "https://toulouse.demosphere.net/",
      "https://radar.squat.net/fr/events/city/Toulouse",
      "https://la-toulouse.fr/category/evenement/",
    ],
  },
  {
    title: "Événements gratuits des médias",
    links: [
      "https://www.amis.monde-diplomatique.fr/",
      "https://infolocale.actu.fr/occitanie/haute-garonne/toulouse-31000",
    ],
  },
    {
    title: "Évènements gratuits des établissements de nuit",
    links: [
      "https://auchatnoir.noblogs.org/",
      "https://www.facebook.com/levasion.bar/events?locale=fr_FR",
    ],
  },
  {
    title: "Événements gratuits des bars associatifs",
    links: [
      "http://lapasserelle-negreneys.org/",
      "https://www.facebook.com/lapasserellenegreneys/events",
      "https://www.sozinho.org/agenda/",
      "https://www.placecommune.fr/prog1",
      "https://www.maisonmalepere.fr/programmation",
      "https://cafe-lastronef.fr/programme/",
    ],
  },
  {
    title: "Événements culturels alternatifs",
    links: [
      "https://lachapelletoulouse.com/evenements/",
      "http://lehangar.eklablog.com/",
      "https://vive.mixart-myrys.org/",
    ],
  },
  {
    title: "Événements des librairies",
    links: [
      "https://www.ombres-blanches.fr/posts/30/Nos-evenements",
      "https://www.librairieprivat.com/agenda.php",
      "https://www.librairie-terranova.fr/agenda-librairie",
      "https://www.fnac.com/Toulouse-Wilson/Fnac-Toulouse-Wilson/cl55/w-4",
      "https://www.fnac.com/Toulouse-Labege/Fnac-Labege/cl57/w-4",
    ],
  },
  {
    title: "Événements des orchestres, bals et concerts",
    links: [
      "https://conservatoire.toulouse.fr/agenda/",
      "http://www.orchestre-h2o.fr",
      "https://orchestre.ut-capitole.fr/accueil/concerts",
      "https://www.out-toulouse.fr/saison-en-cours",
      "https://philharmonia-tolosa.fr/?cat=5",
      "https://orchestre-opus31.fr/events/",
      "http://ensemble-orchestral-pierre-de-fermat.fr/concerts-a-venir.php",
      "https://www.comdt.org/saison/les-concerts/",
      "https://agendatrad.org/calendrier/France/Occitanie",
      "https://www.facebook.com/groups/221534187648",
      "https://www.diversdanses.org/",
      "https://www.facebook.com/Diversdanse/?locale=fr_FR",
      "https://www.facebook.com/page.bombes.2.bal/?locale=fr_FR",
      "https://toulouse-les-orgues.org/",
    ],
  },
    {
    title: "Événements des halles",
    links: [
      "https://halles-cartoucherie.fr/agenda/",
      "https://www.leshallesdelatransition.com/evenements-programmation",
    ],
  },
    {
    title: "Événements des lieux culturels publics",
    links: [
      "https://www.facebook.com/EspaceRoguet/events",
      "https://www.facebook.com/theatredesmazades/events",
    ],
  },
  {
    title: "Événements des conférences et débats gratuits",
    links: [
      "https://www.amis.monde-diplomatique.fr/",
      "https://www.fest.fr/agenda/haute-garonne/toulouse/conferences-forums-et-debats",
      "https://www.rencontres-occitanie.fr/",
      "https://museum.toulouse-metropole.fr/agenda/type/rencontres-conferences/",
      "https://www.tse-fr.eu/fr/events/conferences",
      "https://www.arnaud-bernard.net/conversations-socratiques/",        
    ],
  },
    {
    title: "Événements des musées gratuit",
    links: [
      "https://museum.toulouse-metropole.fr/agenda/type/rencontres-conferences/",
      "https://www.cite-espace.com/a-la-une/",
    ],
  },
    {
    title: "Événements scientifiques",
    links: [
      "https://www.canal-u.tv/chaines/fermatscience/voyage-en-mathematique",
      "https://www.chu-toulouse.fr/agenda/",
    ],
  },
  {
    title: "Événements des établissements de l'enseignement",
    links: [
      "https://www.univ-tlse3.fr/agenda",
      "https://www.univ-tlse3.fr/actualites",
      "https://www.univ-tlse2.fr/accueil/agenda",
      "https://culture.univ-tlse2.fr/accueil/a-venir/a-la-fabrique",
      "https://www.ut-capitole.fr/accueil/campus/espace-media/actualites",
      "https://www.inp-toulouse.fr/fr/actualites.html",     
      "https://www.univ-toulouse.fr/des-campus-attractifs/culture",
    ],
  },
    {
    title: "Événements particuliers",
    links: [
      "https://carnavaldetoulouse.fr/SiteCarnaval/",
      "https://www.tourisme-occitanie.com/agenda/par-date/mois/agenda-mars/?id1[q]=carnaval&id1[geo]=46.521075663842865~9.151611328125002~40.979898069620155~-3.6254882812500004",
    ],
  },
    {
    title: "Événements d'exposition",
    links: [
      "https://www.chu-toulouse.fr/agenda/",
    ],
  },
  {
    title: "Événements de botanique",
    links: [
      "http://lacaravanedescueilleurs.fr/stages-ateliers/",
      "https://www.hautegaronnetourisme.com/resultats-de-recherche/?search=botanique",
      "https://arbresetpaysagesdautan.fr",
      "https://www.mairie-revel.fr/agenda/",
      "https://www.destination-belledonne.com/offres/balade-botanique-contee-comestibles-medicinales-de-juillet-revel-fr-5407688/#tariffs",
      "https://www.eventbrite.fr/d/france--toulouse/botanique/",
      "https://www.billetweb.fr/balade-botanique-comestibles-medicinales-daout1",
      "https://www.mairie-revel.fr/agenda/",
      "https://tourisme.hautstolosans.fr/fr/diffusio/fetes-et-manifestations/rv-aux-jardins-visite-du-jardin-pedagogique-grenade-sur-garonne_TFOFMAMID031V50VXJB",
    ],
  },
    {
    title: "Événements d'art",
    links: [
      "https://www.facebook.com/ArtByLizzie31/",
    ],
  },
    {
    title: "Événements de Festivals",
    links: [
      "https://www.jds.fr/toulouse/agenda/manifestations-fetes-festivals-137_B",
      "https://31.agendaculturel.fr/festival/",
      "https://www.helloasso.com/e/reg/occitanie/dep/haute-garonne/ville/toulouse/act/festival",
    ],
  },
  {
    title: "Événements de Noël",
    links: [
      "https://www.jds.fr/toulouse/agenda/concert-de-l-avent-et-de-noel-270_B",
      "https://www.unidivers.fr/event/theatre-du-capitole-toulouse-2022-12-10t2000000100/",
      "https://31.agendaculturel.fr/festival/spectacles-de-noel-toulouse.html",
      "https://toulouse-les-orgues.org/evenement/concert-de-noel/",
    ],
  },
    {
    title: "Évènements de marchés de Noël",
    links: [
      "https://www.jds.fr/toulouse/agenda/concert-de-l-avent-et-de-noel-270_B",
      "http://marchedenoeltoulouse.fr/",
      "https://noel.org/31-Haute-Garonne",
      "https://www.festinoel.com/agendas-departement-31.html",
      "https://toulouse.kidiklik.fr/articles/336279-les-marches-de-noel-autour-de-toulouse.html",
      "https://www.helloasso.com/e/reg/occitanie/dep/haute-garonne/act/concert",
      "https://www.lacordevocale.org/agenda/31-haute-garonne.html",
      "https://31.agendaculturel.fr/festival/spectacles-de-noel/",
    ],
  },
  {
    title: "Événements culturels et gratuits",
    links: [
      "https://www.helloasso.com/associations/culture-ambition-toulouse",
      "https://www.eventbrite.fr/d/france--toulouse/gratuit/",
      "https://fr-fr.facebook.com/groups/221534187648/",
      "https://www.culture31.com/",
      "https://www.toulouseinfos.fr/actualites/culture/50521-carte-toulouse-cultures.html",
      "https://www.univ-toulouse.fr/des-campus-attractifs/culture",
      "https://www.instagram.com/toulouse_culture/",
      "https://actu.fr/toulouse/loisirs-culture",
      "https://www.cultureenmouvements.org/agenda",
    ],
  },
];

export default function OrganiserSortiesPage() {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

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
          Explore des centaines de sites pour trouver des idées d'événements gratuits, culturels, associatifs ou festifs à Toulouse.
        </p>

        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.title} className="bg-background p-4 rounded-lg shadow-sm border">
              <button
                onClick={() =>
                  setOpenCategory(openCategory === category.title ? null : category.title)
                }
                className="w-full flex justify-between items-center text-left font-semibold text-lg text-primary"
              >
                {category.title}
                {openCategory === category.title ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>

              {openCategory === category.title && (
                <div className="mt-3 space-y-2">
                  {category.links.map((url) => (
                    <div
                      key={url}
                      className="flex justify-between items-center border p-3 rounded-lg hover:bg-muted transition"
                    >
                      <span className="truncate text-sm">{url}</span>
                      <Button asChild size="sm" variant="secondary">
                        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                          Ouvrir <ExternalLink className="h-4 w-4 ml-2" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
