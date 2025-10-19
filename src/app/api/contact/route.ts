// src/app/api/contact/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { verifyPayload } from 'altcha-lib';

export const runtime = 'nodejs';

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'support@default.com';
const ALTCHA_HMAC_SECRET = process.env.ALTCHA_HMAC_SECRET;

if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn('⚠️ Configuration SMTP incomplète. Vérifie tes variables d’environnement.');
}

// Configuration du transport SMTP
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
  console.log('🟢 /api/contact POST reçu');

  if (!ALTCHA_HMAC_SECRET) {
    console.error('❌ ALTCHA_HMAC_SECRET manquant.');
    return NextResponse.json(
      { message: 'Erreur serveur : clé ALTCHA manquante.' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    console.log('📩 Données reçues du formulaire :', body);

    const { name, email, subject, message, altcha } = body;

    if (!altcha) {
      console.warn('⚠️ Jeton ALTCHA manquant.');
      return NextResponse.json(
        { message: 'Veuillez compléter la vérification ALTCHA.' },
        { status: 400 }
      );
    }

    // Vérification ALTCHA
    const isValid = await verifyPayload({ payload: altcha, secret: ALTCHA_HMAC_SECRET });
    console.log('🔍 Résultat de la vérification ALTCHA :', isValid);

    if (!isValid) {
      console.warn('⚠️ Échec de la vérification ALTCHA');
      return NextResponse.json(
        { message: 'Vérification anti-bot échouée. Veuillez réessayer.' },
        { status: 403 }
      );
    }

    // Vérifier connexion SMTP
    try {
      await transporter.verify();
      console.log('✅ Connexion SMTP OK');
    } catch (smtpCheckError) {
      console.error('❌ Impossible de se connecter au serveur SMTP :', smtpCheckError);
      return NextResponse.json(
        { message: 'Erreur serveur : impossible de se connecter au serveur SMTP.' },
        { status: 500 }
      );
    }

    // Préparer l’e-mail
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

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Message envoyé avec succès par ${name} <${email}>`);
    } catch (sendError) {
      console.error('❌ Erreur lors de l’envoi de l’e-mail :', sendError);
      return NextResponse.json(
        { message: 'Erreur serveur : impossible d’envoyer l’e-mail.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Message envoyé avec succès !' }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Erreur serveur contact :', error);
    return NextResponse.json(
      { message: 'Erreur interne du serveur. Veuillez réessayer plus tard.' },
      { status: 500 }
    );
  }
}
