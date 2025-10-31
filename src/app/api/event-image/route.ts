import { NextRequest, NextResponse } from 'next/server';

// Récupération des variables d'environnement au niveau du module
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;

export async function GET(req: NextRequest) {
  try {
    // 1. Vérification de la configuration critique
    if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID) {
      console.error("Configuration Error: DISCORD_BOT_TOKEN or DISCORD_GUILD_ID is missing.");
      return NextResponse.json({ 
          error: 'Server configuration missing Discord token or Guild ID.' 
      }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    const imageHash = searchParams.get('imageHash');

    // 2. Vérification des paramètres de la requête client
    if (!eventId || !imageHash) {
      return NextResponse.json({ error: 'Missing eventId or imageHash parameters' }, { status: 400 });
    }

    // 🏆 CORRECTION CLÉ : Utilisation de l'ID de Guilde dans l'URL Discord
    // Le format correct est /guilds/{guild_id}/events/{event_id}/{image_hash}
    const url = `https://cdn.discordapp.com/guilds/${DISCORD_GUILD_ID}/events/${eventId}/${imageHash}.png?size=256`;

    // 3. Récupération de l'image avec authentification Bot
    const imageRes = await fetch(url, {
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      },
      // Ajout d'un timeout pour éviter les plantages (cause potentielle de 502)
      signal: AbortSignal.timeout(5000), 
    });

    if (!imageRes.ok) {
      // 4. Gestion des erreurs de Discord (ex: 404 si l'image n'existe pas)
      console.warn(`Discord Fetch Failed: URL=${url}, Status=${imageRes.status}`);
      // Renvoyer l'erreur de Discord (ex: 404) au client
      return NextResponse.json({ 
          error: `Failed to fetch image from Discord (Status: ${imageRes.status})` 
      }, { status: imageRes.status });
    }

    // 5. Renvoyer l'image
    const buffer = await imageRes.arrayBuffer();
    const contentType = imageRes.headers.get('content-type') || 'image/png';

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': contentType,
        // Utiliser le cache de Discord si disponible, sinon PNG
        'Cache-Control': 'public, max-age=3600', 
      },
    });

  } catch (err) {
    // 6. Gestion des erreurs internes (ex: timeout de fetch ou crash)
    console.error('API Internal Error:', err);
    console.log('Fetching image from:', url);
    console.log('Response status:', imageRes.status);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
