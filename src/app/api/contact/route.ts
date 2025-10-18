// src/app/api/contact/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

// --- Variables d'environnement ---
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'support@default.com';
const TURNSTILE_SECRET_KEY = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

// --- Vérification SMTP ---
if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn('⚠️ Configuration SMTP incomplète. Vérifie tes variables d’environnement sur Vercel.');
}

// --- Transport Nodemailer ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: Request) {
  if (!TURNSTILE_SECRET_KEY) {
    console.error('❌ CLOUDFLARE_TURNSTILE_SECRET_KEY est manquant.');
    return NextResponse.json(
      { message: 'Erreur serveur : clé Turnstile manquante.' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { name, email, message, 'cf-turnstile-response': token } = body;

    if (!token) {
      return NextResponse.json(
        { message: 'Vérification anti-bot manquante.' },
        { status: 400 }
      );
    }

    // --- Vérification côté serveur Turnstile ---
    const params = new URLSearchParams({
      secret: TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: request.headers.get('cf-connecting-ip') || '',
    });

    const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    const result = await verification.json();

    if (!result.success) {
      console.warn('⚠️ Échec Turnstile :', result['error-codes']);
      return NextResponse.json(
        { message: 'Vérification anti-bot échouée.' },
        { status: 403 }
      );
    }

    // --- Envoi de l’email ---
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: CONTACT_EMAIL,
      subject: `[CONTACT] Message de ${name} <${email}>`,
      html: `<p><strong>Nom:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong></p>
             <p>${message.replace(/\n/g, '<br>')}</p>`,
    });

    return NextResponse.json({ message: 'Message envoyé avec succès !' }, { status: 200 });
  } catch (err: any) {
    console.error('❌ Erreur serveur contact :', err);
    return NextResponse.json(
      { message: 'Erreur interne du serveur, veuillez réessayer plus tard.' },
      { status: 500 }
    );
  }
}
