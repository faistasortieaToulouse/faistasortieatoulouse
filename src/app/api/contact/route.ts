// src/app/api/contact/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// ✅ Forcer l'utilisation du runtime Node.js (obligatoire pour Nodemailer)
export const runtime = 'nodejs';

// --- Variables d'environnement ---
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'support@default.com';
const TURNSTILE_SECRET_KEY = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

// --- Vérification de la configuration SMTP ---
if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn(
    '⚠️ Configuration SMTP incomplète. Vérifie tes variables d’environnement sur Vercel.'
  );
}

// --- Configuration du transport SMTP ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // ex: smtp.gmail.com
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true pour 465, false sinon
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// --- Handler principal ---
export async function POST(request: Request) {
  if (!TURNSTILE_SECRET_KEY) {
    console.error('❌ CLOUDFLARE_TURNSTILE_SECRET_KEY est manquant.');
    return NextResponse.json(
      { message: 'Erreur de configuration serveur (clé Turnstile manquante).' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { name, email, subject, message, 'cf-turnstile-response': turnstileToken } = body;

    // --- Étape 1 : Validation Turnstile ---
    if (!turnstileToken) {
      return NextResponse.json(
        { message: 'Vérification anti-bot manquante.' },
        { status: 400 }
      );
    }

    const verificationData = new URLSearchParams({
      secret: TURNSTILE_SECRET_KEY,
      response: turnstileToken,
      remoteip: request.headers.get('cf-connecting-ip') || '',
    });

    const verificationResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: verificationData,
      }
    );

    const verificationResult = await verificationResponse.json();

    if (!verificationResult.success) {
      console.warn(
        '⚠️ Échec de la vérification Turnstile:',
        verificationResult['error-codes']
      );
      return NextResponse.json(
        { message: 'Vérification anti-bot échouée. Veuillez réessayer.' },
        { status: 403 }
      );
    }

    // --- Étape 2 : Envoi de l’e-mail ---
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: CONTACT_EMAIL,
      subject: `[CONTACT] ${subject} - De: ${name}`,
      html: `
        <p><strong>De:</strong> ${name} &lt;${email}&gt;</p>
        <p><strong>Sujet:</strong> ${subject}</p>
        <hr>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>Envoyé via le formulaire de contact du site.</small></p>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log(`✅ Message envoyé avec succès par ${name} <${email}>`);

    return NextResponse.json(
      { message: 'Message envoyé avec succès !' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Erreur serveur contact :', error);
    return NextResponse.json(
      {
        message:
          'Erreur interne du serveur lors du traitement du message. Veuillez réessayer plus tard.',
      },
      { status: 500 }
    );
  }
}
