// src/app/api/altcha/route.ts
import { NextResponse } from 'next/server';
import { createChallenge } from 'altcha-lib';

export const runtime = 'nodejs';

// Vérifie que la clé secrète existe
const ALTCHA_HMAC_SECRET = process.env.ALTCHA_HMAC_SECRET;

if (!ALTCHA_HMAC_SECRET) {
  console.error('❌ [ALTCHA API] ALTCHA_HMAC_SECRET manquant !');
  throw new Error('ALTCHA_HMAC_SECRET manquant !');
}

export async function GET() {
  try {
    console.log('🔹 [ALTCHA API] Requête GET reçue pour challenge');

    // ✅ Génération du challenge ALTCHA v5.2
    const challenge = await createChallenge({
      hmacKey: ALTCHA_HMAC_SECRET,
      algorithm: 'SHA-256', // plus explicite
      version: 'v5', // assure compatibilité future
    });

    // Log non verbeux en prod
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ [ALTCHA API] Challenge généré :', JSON.stringify(challenge, null, 2));
    }

    return NextResponse.json(challenge, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.error('❌ [ALTCHA API] Erreur lors de la génération du challenge :', err);
    return NextResponse.json(
      { message: 'Erreur serveur ALTCHA.' },
      { status: 500 }
    );
  }
}
