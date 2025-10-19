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
    console.log('🔹 Demande de challenge ALTCHA reçue');
    
    const challenge = await createChallenge({ hmacKey: ALTCHA_HMAC_SECRET });

    console.log('✅ Challenge ALTCHA généré avec succès', challenge);
    return NextResponse.json(challenge);
  } catch (err) {
    console.error('❌ Erreur lors de la génération du challenge ALTCHA :', err);
    return NextResponse.json(
      { message: 'Erreur serveur ALTCHA.' },
      { status: 500 }
    );
  }
}
