'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function DiscordWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rejoins la conversation</CardTitle>
      </CardHeader>
      <CardContent>
        <iframe
          src="https://discord.com/widget?id=1422806103267344416&theme=dark"
          width="350"
          height="500"
          allowtransparency="true"
          frameBorder="0"
          sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          className="rounded-lg"
        ></iframe>
      </CardContent>
    </Card>
  );
}
