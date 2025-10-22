// src/app/api/altcha/route.ts
import { NextResponse } from 'next/server';
import { createChallenge } from 'altcha-lib';

export const runtime = 'nodejs';

const ALTCHA_HMAC_SECRET = process.env.ALTCHA_HMAC_SECRET;

// --- Vérifie la configuration ---
if (!ALTCHA_HMAC_SECRET) {
  console.warn('⚠️ [ALTCHA API] ALTCHA_HMAC_SECRET manquant. ALTCHA ne fonctionnera pas sans clé !');
}

/**
 * 🔹 Route GET /api/altcha
 * Génère un challenge ALTCHA adaptatif et performant
 */
export async function GET(req: Request) {
  console.log('🔹 [ALTCHA API] Requête GET reçue pour challenge');

  if (!ALTCHA_HMAC_SECRET) {
    return NextResponse.json(
      { success: false, message: 'ALTCHA non configuré sur le serveur.' },
      { status: 500 }
    );
  }

  try {
    // --- Détection du type d’appareil ---
    const ua = req.headers.get('user-agent') || '';
    const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);

    // --- Génération du challenge ALTCHA ---
    const challenge = await createChallenge({
      hmacKey: ALTCHA_HMAC_SECRET,
      algorithm: 'SHA-256',
      version: 'v5',

      // 🔹 Niveau de difficulté ajusté dynamiquement
      difficulty: isMobile ? 16 : 18,

      // 🔹 Durée de validité augmentée (3 min)
      expiresIn: 180,

      // 🔹 Métadonnées pour debug (facultatif)
      metadata: { device: isMobile ? 'mobile' : 'desktop' },
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ [ALTCHA API] Challenge généré :', challenge);
    }

    // --- Envoi du challenge ---
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
