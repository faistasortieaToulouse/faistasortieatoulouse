
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Hash } from 'lucide-react';

interface Channel {
  id: string;
  name: string;
  position: number;
  type: number;
  parent_id?: string;
}

const serverStructure = [
    { id: '1423208726629710000', name: 'ACCUEIL & ANNONCES' },
    { id: '1423208981501050000', name: 'ART & CULTURE' },
    { id: '1423213234403540000', name: 'CAFÉ DES LANGUES' },
    { id: '1423209181992970000', name: 'FÊTES & NUITS' },
    { id: '1423209220307810000', name: 'MANGER & BOIRE' },
    { id: '1423209261831550000', name: 'SPORT & LOISIRS' },
    { id: '1423209304051280000', name: 'TECH & INFO' },
    { id: '1423209482694950000', name: 'TOULOUSE & OCCITANIE' },
    { id: '1423230846541760000', name: 'SORTIES ENTRE FILLES' },
    { id: '1423231206371220000', name: 'SORTIES ETUDIANTES' },
];


export function DiscordChannelList({ channels }: { channels?: Channel[] }) {
  const categories = serverStructure;
  const subChannels = channels?.filter(c => c.type !== 4 && c.parent_id) || [];
  const defaultOpenCategories = categories.map(c => c.id);

  if (!channels || channels.length === 0) {
      return (
           <Card>
              <CardHeader>
                <CardTitle>Salons du serveur</CardTitle>
                <CardDescription>
                  Liste de tous les salons disponibles, groupés par catégorie.
                </CardDescription>
              </CardHeader>
              <CardContent>
                  <p className="text-sm text-muted-foreground">
                      Les données des salons n'ont pas pu être chargées. Vérifiez que le widget du serveur Discord est activé.
                  </p>
              </CardContent>
           </Card>
      );
  }

  return (
      <Card>
          <CardHeader>
              <CardTitle>Salons du serveur</CardTitle>
              <CardDescription>
                  Liste de tous les salons disponibles, groupés par catégorie.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <ScrollArea className="h-96">
                  <Accordion
                      type="multiple"
                      className="w-full pr-4"
                      defaultValue={defaultOpenCategories}
                  >
                      {categories.map(category => {
                        const filteredSubChannels = subChannels.filter(sc => sc.parent_id === category.id).sort((a,b) => a.position - b.position);
                        
                        return (
                          <AccordionItem key={category.id} value={category.id}>
                              <AccordionTrigger className="text-sm font-semibold uppercase text-muted-foreground hover:no-underline">
                                  {category.name}
                              </AccordionTrigger>
                              <AccordionContent>
                                  <div className="flex flex-col gap-2 pl-4 pt-2">
                                      {filteredSubChannels.length > 0 ? (
                                          filteredSubChannels
                                              .map(channel => (
                                                  <div
                                                      key={channel.id}
                                                      className="flex items-center gap-2 rounded-md p-1"
                                                  >
                                                      <Hash className="h-4 w-4 text-muted-foreground" />
                                                      <span className="text-sm font-medium">
                                                          {channel.name}
                                                      </span>
                                                  </div>
                                              ))
                                      ) : (
                                          <p className="text-xs text-muted-foreground">
                                              Aucun salon disponible dans cette catégorie via le widget.
                                          </p>
                                      )}
                                  </div>
                              </AccordionContent>
                          </AccordionItem>
                        )
                      })}
                  </Accordion>
              </ScrollArea>
          </CardContent>
      </Card>
  );
}
