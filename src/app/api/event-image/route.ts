import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    const imageHash = searchParams.get('imageHash');

    if (!eventId || !imageHash) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // URL Discord officielle pour l'image de l'événement
    const url = `https://cdn.discordapp.com/guild-events/${eventId}/${imageHash}.png?size=256`;

    // Récupération côté serveur avec le token du bot pour éviter le 402
    const imageRes = await fetch(url, {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`, // ajoute ton token bot dans .env
      },
    });

    if (!imageRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: imageRes.status });
    }

    const buffer = await imageRes.arrayBuffer();

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600', // cache 1h
      },
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
