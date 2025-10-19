// src/app/api/altcha/route.ts
import { NextResponse } from 'next/server';
import { createChallenge } from 'altcha-lib';

export const runtime = 'nodejs';

const ALTCHA_HMAC_SECRET = process.env.ALTCHA_HMAC_SECRET;
if (!ALTCHA_HMAC_SECRET) {
  throw new Error('ALTCHA_HMAC_SECRET manquant !');
}

// GET : le widget ALTCHA appelle cette route pour récupérer le challenge
export async function GET() {
  try {
    const challenge = await createChallenge({
      hmacKey: ALTCHA_HMAC_SECRET,
    });

    return NextResponse.json(challenge);
  } catch (err) {
    console.error('❌ Erreur lors de la génération du challenge ALTCHA :', err);
    return NextResponse.json({ message: 'Erreur serveur ALTCHA.' }, { status: 500 });
  }
}
