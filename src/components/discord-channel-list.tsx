'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Hash, Volume2 } from 'lucide-react';
import Link from 'next/link';

interface Channel {
  id: string;
  name: string;
  type: number; // 0 texte, 2 vocal, 4 catégorie
  parent_id?: string;
  position: number;
}

export function DiscordChannelList() {
  const [channels, setChannels] = useState<Channel[] | null>(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await fetch('/api/discord', { cache: 'no-store' });
        const json = await res.json();
        setChannels(json.channels ?? []);
      } catch {}
    };
    fetchChannels();
  }, []);

  if (!channels) return <p>Chargement des salons Discord…</p>;
  if (channels.length === 0) return <p>Aucun salon disponible.</p>;

  // Organisation
  const categories = channels.filter(c => c.type === 4).sort((a, b) => a.position - b.position);
  const categorized: Record<string, Channel[]> = {};
  categories.forEach(cat => categorized[cat.id] = []);
  categorized['null'] = [];
  channels.filter(c => c.type === 0 || c.type === 2).forEach(ch => {
    const parentId = ch.parent_id ?? 'null';
    if (categorized[parentId]) categorized[parentId].push(ch);
    else categorized['null'].push(ch);
  });
  if (categorized['null'].length) categories.unshift({ id: 'null', name: 'SALONS SANS CATÉGORIE', type: 4, position: -1 });

  const GUILD_ID = '1422806103267344416';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Salons du serveur</CardTitle>
        <CardDescription>Liste groupée par catégorie</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <Accordion type="multiple" defaultValue={categories.map(c => c.id)}>
            {categories.map(cat => (
              <AccordionItem key={cat.id} value={cat.id}>
                <AccordionTrigger className="text-sm font-semibold uppercase text-muted-foreground">{cat.name}</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-2 pl-4 pt-2">
                    {(categorized[cat.id] ?? []).map(ch => (
                      <Link key={ch.id} href={`https://discord.com/channels/${GUILD_ID}/${ch.id}`} target="_blank" className="flex items-center gap-2 p-1 hover:bg-muted rounded-md">
                        {ch.type === 2 ? <Volume2 className="h-4 w-4 text-primary" /> : <Hash className="h-4 w-4 text-muted-foreground" />}
                        <span className="text-sm font-medium truncate">{ch.name.replace(/-/g, ' ')}</span>
                      </Link>
                    ))}
                    {(categorized[cat.id] ?? []).length === 0 && <p className="text-xs text-muted-foreground">Aucun salon visible dans cette catégorie.</p>}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
