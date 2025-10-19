// src/app/api/altcha/route.ts
import { NextResponse } from 'next/server';
import { createChallenge } from 'altcha-lib';

export const runtime = 'nodejs';

const ALTCHA_HMAC_SECRET = process.env.ALTCHA_HMAC_SECRET;

if (!ALTCHA_HMAC_SECRET) {
  console.error('❌ [ALTCHA API] ALTCHA_HMAC_SECRET manquant !');
  throw new Error('ALTCHA_HMAC_SECRET manquant !');
}

export async function GET() {
  try {
    console.log('🔹 [ALTCHA API] Requête GET reçue pour challenge');

    // Génération du challenge ALTCHA v5
    const challenge = await createChallenge({
      hmacKey: ALTCHA_HMAC_SECRET,
      version: 'v5', // s'assure qu'on utilise bien la dernière version
    });

    console.log('✅ [ALTCHA API] Challenge généré :', JSON.stringify(challenge));

    return NextResponse.json(challenge, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (err) {
    console.error('❌ [ALTCHA API] Erreur génération challenge :', err);
    return NextResponse.json({ message: 'Erreur serveur ALTCHA.' }, { status: 500 });
  }
}
