// src/app/api/contact/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import * as altcha from 'altcha-lib'; // ✅ ALTCHA v5.x compatible

export const runtime = 'nodejs';

// --- Variables d’environnement ---
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'support@default.com';
const ALTCHA_HMAC_SECRET = process.env.ALTCHA_HMAC_SECRET;

// --- Vérifications de configuration ---
if (!ALTCHA_HMAC_SECRET) {
  console.error('❌ [Contact API] ALTCHA_HMAC_SECRET manquant ! Vérifie ta configuration sur Vercel.');
}

if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn('⚠️ [Contact API] Configuration SMTP incomplète. Vérifie tes variables .env');
}

// --- Transport SMTP ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10_000, // 10s
});

// --- Fonction utilitaire : décodage Base64 si nécessaire ---
function getDecodedKey(): Buffer | string {
  if (!ALTCHA_HMAC_SECRET) return '';
  try {
    // Si c’est du Base64 valide, on retourne le Buffer
    return Buffer.from(ALTCHA_HMAC_SECRET, 'base64');
  } catch {
    // Sinon, on retourne la chaîne brute
    return ALTCHA_HMAC_SECRET;
  }
}

// --- Fonction utilitaire : échapper le HTML ---
function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// --- Route POST /api/contact ---
export async function POST(request: Request) {
  console.log('🔹 [Contact API] Requête POST reçue');

  try {
    const body = await request.json();
    console.log('📩 [Contact API] Données reçues :', body);

    const { name, email, subject, message, altcha: altchaPayload } = body;

    // --- Vérifications basiques ---
    if (!name || !email || !subject || !message) {
      console.warn('⚠️ [Contact API] Champs manquants');
      return NextResponse.json(
        { success: false, message: 'Tous les champs sont requis.' },
        { status: 400 }
      );
    }

    if (!altchaPayload) {
      console.warn('⚠️ [Contact API] Jeton ALTCHA manquant');
      return NextResponse.json(
        { success: false, message: 'Veuillez compléter la vérification ALTCHA.' },
        { status: 400 }
      );
    }

    if (!ALTCHA_HMAC_SECRET) {
      console.error('❌ [Contact API] ALTCHA_HMAC_SECRET manquant');
      return NextResponse.json(
        { success: false, message: 'Erreur serveur : clé ALTCHA absente.' },
        { status: 500 }
      );
    }

    // --- Vérification ALTCHA ---
    console.log('🧩 [Contact API] ALTCHA_HMAC_SECRET présent ? ', !!ALTCHA_HMAC_SECRET);
    console.log('🔍 [Contact API] Tentative de vérification ALTCHA...');
    console.log('🔧 [Contact API] altcha-lib exports →', Object.keys(altcha));

    let isValid = false;
    try {
      const decodedKey = getDecodedKey();

      console.log('📦 [Contact API] Payload ALTCHA reçu :', altchaPayload.slice(0, 100) + '...');
      if (typeof altcha.verify !== 'function') {
        throw new Error('La fonction altcha.verify() est introuvable dans altcha-lib !');
      }

      // ✅ Vérification via altcha-lib
      isValid = await altcha.verify({
        payload: altchaPayload,
        hmacKey: decodedKey,
      });

      console.log('✅ [Contact API] ALTCHA vérifié →', isValid);
    } catch (err: any) {
      console.error('❌ [Contact API] Erreur lors de la vérification ALTCHA :', err);
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la vérification ALTCHA.' },
        { status: 500 }
      );
    }

    if (!isValid) {
      console.warn('⚠️ [Contact API] Vérification ALTCHA invalide (signature incorrecte)');
      return NextResponse.json(
        { success: false, message: 'Vérification anti-bot échouée. Réessayez.' },
        { status: 403 }
      );
    }

    // --- Vérification de la connexion SMTP ---
    try {
      await transporter.verify();
      console.log('✅ [Contact API] Connexion SMTP OK');
    } catch (smtpErr) {
      console.error('❌ [Contact API] SMTP indisponible :', smtpErr);
      return NextResponse.json(
        { success: false, message: 'Serveur mail indisponible. Réessayez plus tard.' },
        { status: 500 }
      );
    }

    // --- Préparer et envoyer l’e-mail ---
    const sanitizedMessage = escapeHTML(message).replace(/\n/g, '<br>');
    const sanitizedName = escapeHTML(name);
    const sanitizedSubject = escapeHTML(subject);
    const sanitizedEmail = escapeHTML(email);

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: CONTACT_EMAIL,
      subject: `[CONTACT] ${sanitizedSubject} - De: ${sanitizedName}`,
      html: `
        <p><strong>De:</strong> ${sanitizedName} &lt;${sanitizedEmail}&gt;</p>
        <p><strong>Sujet:</strong> ${sanitizedSubject}</p>
        <hr>
        <p><strong>Message:</strong></p>
        <p>${sanitizedMessage}</p>
        <hr>
        <p><small>Envoyé depuis le formulaire de contact du site.</small></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📨 [Contact API] Message envoyé par ${sanitizedName} <${sanitizedEmail}>`);

    return NextResponse.json(
      { success: true, message: 'Message envoyé avec succès !' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ [Contact API] Erreur interne :', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur. Réessayez plus tard.' },
      { status: 500 }
    );
  }
}
