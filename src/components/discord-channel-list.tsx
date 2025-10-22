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
import { Hash, Volume2 } from 'lucide-react'; // Ajout de Volume2 pour les salons vocaux
import Link from 'next/link'; // Ajout de Link pour naviguer

// --- Interface (Types de Données) ---
interface Channel {
  id: string;
  name: string;
  position: number;
  type: number; // 0: Texte, 2: Vocal, 4: Catégorie
  parent_id?: string;
}

// --- Organisation Dynamique des Canaux ---
const organizeChannels = (channels: Channel[] | undefined) => {
    if (!channels) return { categories: [], categorizedChannels: {} };

    // Filtrer les catégories (Type 4)
    const categories: Channel[] = channels
        .filter(c => c.type === 4)
        .sort((a, b) => a.position - b.position);

    const categorizedChannels: { [id: string]: Channel[] } = {};
    const categoryIds = categories.map(c => c.id);

    // Initialiser les catégories (y compris une pour les canaux sans parent)
    categoryIds.forEach(id => (categorizedChannels[id] = []));
    categorizedChannels['null'] = [];

    // Filtrer et grouper les salons Texte (0) et Vocal (2)
    channels
        .filter(c => c.type === 0 || c.type === 2)
        .sort((a, b) => a.position - b.position)
        .forEach(channel => {
            const parentId = channel.parent_id || 'null';
            
            if (categorizedChannels[parentId]) {
                categorizedChannels[parentId].push(channel);
            } else {
                // Si la catégorie existe dans l'API mais n'est pas Type 4, ou est cachée, 
                // on la met dans la catégorie "null" pour éviter de perdre le canal.
                categorizedChannels['null'].push(channel);
            }
        });

    // Ajouter la fausse catégorie pour les canaux orphelins (sans parent)
    if (categorizedChannels['null'].length > 0) {
        categories.unshift({
            id: 'null',
            name: 'SALONS SANS CATÉGORIE',
            position: -1,
            type: 4,
        });
    }

    return { categories, categorizedChannels };
};


// --- Composant Principal ---
export function DiscordChannelList({ channels }: { channels?: Channel[] }) {
    
    // Définir l'ID de la guilde pour les liens (doit correspondre à page.tsx)
    const GUILD_ID = '1422806103267344416';
    
    const { categories, categorizedChannels } = organizeChannels(channels);
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
                    <p className="text-sm text-red-500">
                        Aucun salon n'a pu être chargé. Assurez-vous que le Bot est Administrateur du serveur.
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
                          const subChannels = categorizedChannels[category.id] || [];
                          
                          return (
                            <AccordionItem key={category.id} value={category.id}>
                                <AccordionTrigger className="text-sm font-semibold uppercase text-muted-foreground hover:no-underline">
                                    {category.name.replace(/-/g, ' ')}
                                </AccordionTrigger>
                                <AccordionContent>
<div className="flex flex-col gap-2 pl-4 pt-2">
    {subChannels.length > 0 ? (
        subChannels
            .map(channel => (
                <Link
                    key={channel.id}
                    href={`https://discord.com/channels/${GUILD_ID}/${channel.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    // min-w-0 est ajouté pour assurer la bonne gestion du flexbox sur mobile
                    className="flex items-center gap-2 rounded-md p-1 hover:bg-muted transition-colors min-w-0"
                >
                    {channel.type === 2 ? (
                        <Volume2 className="h-4 w-4 text-primary shrink-0" /> // shrink-0 empêche l'icône de rétrécir
                    ) : (
                        <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    {/* truncate est ajouté pour couper les noms trop longs avec '...' */}
                    <span className="text-sm font-medium hover:text-primary truncate"> 
                        {channel.name.replace(/-/g, ' ')}
                    </span>
                </Link>
            ))
    ) : (
        <p className="text-xs text-muted-foreground">
            Aucun salon visible dans cette catégorie.
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
