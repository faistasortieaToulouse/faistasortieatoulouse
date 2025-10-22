'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks } from "lucide-react";

interface Poll {
  question: { text: string };
  answers: { answer_id: number; text: string }[];
}

interface PollMessage {
  id: string;
  poll: Poll;
}

export function DiscordPolls() {
  const [polls, setPolls] = useState<PollMessage[] | null>(null);
  const [error, setError] = useState(false);

  const fetchPolls = async (retry = false) => {
    try {
      const res = await fetch('/api/discord', { cache: 'no-store' });
      if (!res.ok) throw new Error('Discord API error');
      const json = await res.json();
      setPolls(json.polls ?? []);
    } catch (err) {
      if (!retry) setTimeout(() => fetchPolls(true), 2000);
      else setError(true);
    }
  };

  useEffect(() => { fetchPolls(); }, []);

  if (error) return <p className="text-sm text-destructive">Impossible de charger les sondages Discord.</p>;
  if (!polls) return <p>Chargement des sondages Discord…</p>;
  if (polls.length === 0) return null;

  const GUILD_ID = '1422806103267344416';
  const POLLS_CHANNEL_ID = '1422806103904882842';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-x-2">
        <ListChecks className="w-6 h-6 text-primary" />
        <CardTitle>Sondages Discord Actifs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {polls.map((pollMessage) => (
          <div key={pollMessage.id} className="p-3 border rounded-lg bg-secondary/50 shadow-md">
            <h4 className="font-semibold text-lg mb-2 text-foreground">{pollMessage.poll.question.text}</h4>
            <p className="text-sm font-medium mb-1">Options :</p>
            <ul className="space-y-1 ml-4 list-disc text-muted-foreground">
              {pollMessage.poll.answers.map((answer) => (
                <li key={answer.answer_id} className="text-sm">{answer.text}</li>
              ))}
            </ul>
            <a 
              href={`https://discord.com/channels/${GUILD_ID}/${POLLS_CHANNEL_ID}/${pollMessage.id}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-xs text-blue-500 hover:underline"
            >
              Voter sur Discord →
            </a>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
