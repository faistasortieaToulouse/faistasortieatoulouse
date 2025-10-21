// src/app/api/altcha/route.ts
import { NextResponse } from 'next/server';
import { createChallenge } from 'altcha-lib';

export const runtime = 'nodejs';

const ALTCHA_HMAC_SECRET = process.env.ALTCHA_HMAC_SECRET;

// --- Vérifie que la clé secrète existe ---
if (!ALTCHA_HMAC_SECRET) {
  console.warn('⚠️ [ALTCHA API] ALTCHA_HMAC_SECRET manquant. ALTCHA ne fonctionnera pas sans clé !');
}

export async function GET(request: Request) {
  console.log('🔹 [ALTCHA API] Requête GET reçue pour challenge');
    try {
    // Option mobile : lecture d'un paramètre query `?mobile=true`
    const url = new URL(request.url);
    const isMobile = url.searchParams.get('mobile') === 'true';

  if (!ALTCHA_HMAC_SECRET) {
    return NextResponse.json(
      { success: false, message: 'ALTCHA non configuré sur le serveur.' },
      { status: 500 }
    );
  }

  try {
    // ✅ Génération du challenge ALTCHA v5+
    const challenge = await createChallenge({
      hmacKey: ALTCHA_HMAC_SECRET,
      algorithm: 'SHA-256',
      version: 'v5',
      difficulty: isMobile ? 'easy' : 'normal', // ✅ version plus légère pour mobile
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ [ALTCHA API] Challenge généré :', challenge);
    }

    return NextResponse.json(challenge, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
        'Content-Type': 'application/json',
        'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none';",
        'Referrer-Policy': 'no-referrer',
      },
    });
  } catch (err) {
    console.error('❌ [ALTCHA API] Erreur lors de la génération du challenge :', err);

    return NextResponse.json(
      {
        success: false,
        message: 'Erreur interne lors de la génération du challenge ALTCHA.',
      },
      { status: 500 }
    );
  }
}
