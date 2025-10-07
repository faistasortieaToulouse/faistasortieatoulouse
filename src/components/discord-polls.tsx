// src/components/discord-polls.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks } from "lucide-react";

// Interface simplifiée pour les données de sondage passées par le Server Component
interface Poll {
    question: {
        text: string;
    };
    answers: {
        answer_id: number;
        text: string;
    }[];
    // Attention: Les résultats ('results') et l'interaction de vote ne sont pas inclus ici,
    // car ils sont complexes et nécessitent d'être un Client Component.
}

interface DiscordPollsProps {
    polls: {
        id: string;
        poll: Poll;
    }[];
}

export function DiscordPolls({ polls }: DiscordPollsProps) {
    if (!polls || polls.length === 0) {
        return null; // N'affiche rien s'il n'y a pas de sondage actif
    }

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
                            {pollMessage.poll.answers.map((answer: any) => (
                                <li key={answer.answer_id} className="text-sm">
                                    {answer.text}
                                </li>
                            ))}
                        </ul>
                        {/* Ajoutez un lien vers le sondage original */}
                        <a 
                            href={`https://discord.com/channels/${GUILD_ID}/${POLLS_CHANNEL_ID}/${pollMessage.id}`} 
                            target="_blank"
                            className="mt-3 inline-block text-xs text-blue-500 hover:underline"
                            rel="noopener noreferrer"
                        >
                            Voter sur Discord →
                        </a>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

// NOTE: Pour que ce composant fonctionne, vous devez déclarer POLLS_CHANNEL_ID et GUILD_ID 
// dans le composant parent ou les passer en props (ici, nous les utilisons comme si
// ils étaient disponibles globalement pour l'URL).
const GUILD_ID = '1422806103267344416';
const POLLS_CHANNEL_ID = '1422806103904882842';
