'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function DiscordWidget() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rejoins la conversation</CardTitle>
      </CardHeader>
      <CardContent>
        {loaded && (
          <iframe
            src="https://discord.com/widget?id=1422806103267344416&theme=dark"
            width="350"
            height="500"
            allowtransparency="true"
            frameBorder="0"
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
            className="rounded-lg"
          ></iframe>
        )}
      </CardContent>
    </Card>
  );
}
