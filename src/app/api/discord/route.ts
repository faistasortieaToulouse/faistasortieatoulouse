// src/app/api/discord/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

export async function GET() {
  if (!DISCORD_GUILD_ID || !DISCORD_BOT_TOKEN) {
    return NextResponse.json({ error: 'Configuration Discord manquante' }, { status: 500 });
  }

  try {
    const res = await fetch(`https://discord.com/api/guilds/${DISCORD_GUILD_ID}/widget.json`, {
      headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
      cache: 'no-store',
    });

    if (!res.ok) throw new Error(`Erreur Discord API (${res.status})`);

    const data = await res.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (err) {
    console.error('❌ Erreur Discord API :', err);
    return NextResponse.json({ error: 'Erreur lors du chargement Discord' }, { status: 500 });
  }
}
