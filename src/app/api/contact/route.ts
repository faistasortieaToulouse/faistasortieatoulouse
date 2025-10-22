import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import altchaImport from 'altcha-lib';

export const runtime = 'nodejs';

// --- ALTCHA (compatibilité ESM / CJS)
const altcha: any = altchaImport.default || altchaImport;

// --- ENV ---
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'support@default.com';
const ALTCHA_HMAC_SECRET = process.env.ALTCHA_HMAC_SECRET;
const isProd = process.env.NODE_ENV === 'production';

// --- Vérifications initiales ---
if (!ALTCHA_HMAC_SECRET) {
  console.error('❌ [Contact API] ALTCHA_HMAC_SECRET manquant.');
}
if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn('⚠️ [Contact API] Configuration SMTP incomplète.');
}

// --- Transport SMTP (pool réutilisable entre requêtes) ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: true,
  maxConnections: 3,
  connectionTimeout: 10_000,
});

// --- Utilitaires ---
function getDecodedKey(): Buffer | string {
  if (!ALTCHA_HMAC_SECRET) return '';
  try {
    return Buffer.from(ALTCHA_HMAC_SECRET, 'base64');
  } catch {
    return ALTCHA_HMAC_SECRET;
  }
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function verifyAltcha(payload: string): Promise<boolean> {
  if (!ALTCHA_HMAC_SECRET) return false;
  try {
    const decodedKey = getDecodedKey();
    const valid = altcha.verifyServerSignature(payload, decodedKey);
    if (!isProd) console.log('🔐 [ALTCHA] Vérification réussie →', valid);
    return !!valid;
  } catch (err) {
    console.error('❌ [ALTCHA] Erreur de vérification :', err);
    return false;
  }
}

// --- 🧠 Mémoire interne pour limiter les messages ---
const rateLimitMap = new Map<string, { count: number; firstRequest: number }>();
const LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS = 3;

// Nettoyage périodique pour éviter une mémoire infinie
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now - data.firstRequest > LIMIT_WINDOW) rateLimitMap.delete(ip);
  }
}, 60_000); // toutes les 60s

// --- Vérification du quota ---
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, firstRequest: now });
    return true;
  }

  if (now - record.firstRequest > LIMIT_WINDOW) {
    // fenêtre expirée → reset
    rateLimitMap.set(ip, { count: 1, firstRequest: now });
    return true;
  }

  if (record.count >= MAX_REQUESTS) {
    return false;
  }

  record.count++;
  rateLimitMap.set(ip, record);
  return true;
}

// --- Helper pour extraire l’IP du client (Next.js + Vercel compatible) ---
function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  return realIp || 'unknown';
}

// --- POST /api/contact ---
export async function POST(request: Request) {
  const start = Date.now();
  console.log('📩 [Contact API] POST reçu');

  const ip = getClientIp(request);
  if (!checkRateLimit(ip)) {
    console.warn(`🚫 [RateLimit] Trop de requêtes depuis ${ip}`);
    return NextResponse.json(
      { success: false, message: 'Trop de messages envoyés. Réessayez dans quelques minutes.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { name, email, subject, message, altcha: altchaPayload } = body;

    // --- Validation basique ---
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: 'Tous les champs sont requis.' },
        { status: 400 }
      );
    }

    if (!altchaPayload) {
      return NextResponse.json(
        { success: false, message: 'Veuillez compléter la vérification ALTCHA.' },
        { status: 400 }
      );
    }

    // --- Vérification ALTCHA ---
    const validAltcha = await verifyAltcha(altchaPayload);
    if (!validAltcha) {
      return NextResponse.json(
        { success: false, message: 'Vérification anti-bot échouée. Réessayez.' },
        { status: 403 }
      );
    }

    // --- Préparer le contenu du mail ---
    const sanitizedMessage = escapeHTML(message).replace(/\n/g, '<br>');
    const sanitizedName = escapeHTML(name);
    const sanitizedSubject = escapeHTML(subject);
    const sanitizedEmail = escapeHTML(email);

    const mailOptions = {
      from: `"Formulaire Contact" <${process.env.SMTP_USER}>`,
      to: CONTACT_EMAIL,
      subject: `[CONTACT FTS] ${sanitizedSubject} - ${sanitizedName}`,
      html: `
        <p><strong>De :</strong> ${sanitizedName} &lt;${sanitizedEmail}&gt;</p>
        <p><strong>Sujet :</strong> ${sanitizedSubject}</p>
        <hr>
        <p>${sanitizedMessage}</p>
        <hr>
        <p><small>Message envoyé via le site web.</small></p>
      `,
    };

    // --- Envoi ---
    await transporter.sendMail(mailOptions);
    const duration = Date.now() - start;
    console.log(`✅ [Contact API] Email envoyé (${duration}ms) de ${sanitizedEmail} [IP: ${ip}]`);

    return NextResponse.json(
      { success: true, message: 'Message envoyé avec succès !' },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('❌ [Contact API] Erreur interne :', err);
    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur. Réessayez plus tard.' },
      { status: 500 }
    );
  }
}
