// src/app/api/altcha/route.ts
import { NextResponse } from 'next/server';
import { createChallenge } from 'altcha-lib';

export const runtime = 'nodejs';

const ALTCHA_HMAC_SECRET = process.env.ALTCHA_HMAC_SECRET;

if (!ALTCHA_HMAC_SECRET) {
  console.error('❌ ALTCHA_HMAC_SECRET manquant !');
  throw new Error('ALTCHA_HMAC_SECRET manquant !');
}

export async function GET() {
  try {
    console.log('🔹 [ALTCHA API] Demande de challenge reçue');

    // Génération du challenge
    const challenge = await createChallenge({ hmacKey: ALTCHA_HMAC_SECRET });

    // Log détaillé
    console.log('✅ [ALTCHA API] Challenge généré avec succès :', JSON.stringify(challenge));

    return NextResponse.json(challenge, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' }, // Toujours générer un challenge frais
    });
  } catch (err) {
    console.error('❌ [ALTCHA API] Erreur lors de la génération du challenge :', err);

    return NextResponse.json(
      { message: 'Erreur serveur ALTCHA.' },
      { status: 500 }
    );
  }
}
