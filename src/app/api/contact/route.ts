// src/app/api/contact/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Forcer le runtime Node.js pour Nodemailer
export const runtime = 'nodejs';

// --- Variables d'environnement ---
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'support@default.com';
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

// --- Vérification minimale des variables ---
if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.warn(
    '⚠️ Configuration SMTP incomplète. Vérifie tes variables d’environnement sur Vercel.'
  );
}

// --- Configuration Nodemailer ---
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true pour 465, false sinon
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

// --- Handler principal ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: 'Tous les champs sont requis.' },
        { status: 400 }
      );
    }

    // --- Envoi de l’e-mail ---
    const mailOptions = {
      from: SMTP_USER,
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

    console.log(`✅ Message envoyé par ${name} <${email}>`);

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
