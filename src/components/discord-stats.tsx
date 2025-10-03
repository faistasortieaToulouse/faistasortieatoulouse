import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CalendarHeart } from 'lucide-react';

interface DiscordWidgetData {
  id: string;
  name: string;
  instant_invite: string;
  channels: any[];
  members: any[];
  presence_count: number;
  events: any[];
}

export function DiscordStats({ data }: { data: DiscordWidgetData | null }) {
  const memberCount = data?.presence_count ?? 0;
  const eventCount = data?.events?.length ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Membres en ligne</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{memberCount}</div>
          <p className="text-xs text-muted-foreground">Actuellement sur le Discord</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Événements à venir</CardTitle>
          <CalendarHeart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{eventCount}</div>
          <p className="text-xs text-muted-foreground">Planifiés sur le Discord</p>
        </CardContent>
      </Card>
    </div>
  );
}
