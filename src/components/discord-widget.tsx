'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function DiscordWidget() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // ✅ Délai de sécurité pour vérifier si le widget s'affiche
    const timeout = setTimeout(() => {
      if (!loaded) {
        const hasRetried = sessionStorage.getItem('discord-widget-auto-refresh');
        if (!hasRetried) {
          console.log('🔄 Widget Discord non chargé — tentative automatique de rechargement...');
          sessionStorage.setItem('discord-widget-auto-refresh', 'true');
          window.location.reload();
        } else {
          console.warn('⚠️ Widget Discord toujours absent après un rechargement — arrêt des tentatives.');
        }
      } else {
        sessionStorage.removeItem('discord-widget-auto-refresh');
      }
    }, 5000); // 5 secondes avant de considérer que ça n’a pas chargé

    return () => clearTimeout(timeout);
  }, [loaded]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rejoins la conversation</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        {!loaded && (
          <p className="text-sm text-muted-foreground mb-2">
            Chargement du widget Discord…
          </p>
        )}

        <iframe
          src="https://discord.com/widget?id=1422806103267344416&theme=dark"
          width="350"
          height="500"
          allowTransparency={true}
          frameBorder="0"
          sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          className="rounded-lg"
          onLoad={() => setLoaded(true)}
        ></iframe>

        {!loaded && (
          <div className="mt-3">
            <Button
              onClick={() => {
                sessionStorage.removeItem('discord-widget-auto-refresh');
                window.location.reload();
              }}
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Rafraîchir
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
