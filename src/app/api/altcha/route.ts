// src/app/api/contact/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { verifySolution } from 'altcha-lib';

export const runtime = 'nodejs';

// --- Variables d'environnement ---
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'support@default.com';
const ALTCHA_HMAC_SECRET = process.env.ALTCHA_HMAC_SECRET;

// --- Vérification de la configuration SMTP ---
if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn(
    '⚠️ Configuration SMTP incomplète. Vérifie tes variables d’environnement sur Vercel.'
  );
}

// --- Configuration du transport SMTP ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// --- Handler POST principal ---
export async function POST(request: Request) {
  if (!ALTCHA_HMAC_SECRET) {
    console.error('❌ ALTCHA_HMAC_SECRET est manquant.');
    return NextResponse.json(
      { message: 'Erreur de configuration serveur (clé ALTCHA manquante).' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { name, email, subject, message, altcha } = body;

    // --- Vérification ALTCHA ---
    if (!altcha) {
      return NextResponse.json(
        {
          message:
            'Vérification anti-bot manquante. Le widget ALTCHA n’a pas soumis de jeton.',
        },
        { status: 400 }
      );
    }

    const verificationResult = await verifySolution(altcha, {
      hmacKey: ALTCHA_HMAC_SECRET,
    });

    if (!verificationResult.verified) {
      console.warn('⚠️ Échec de la vérification ALTCHA.', verificationResult.error);
      return NextResponse.json(
        { message: 'Vérification anti-bot échouée. Veuillez réessayer.' },
        { status: 403 }
      );
    }

    // --- Envoi de l’e-mail ---
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

    return NextResponse.json({ message: 'Message envoyé avec succès !' }, { status: 200 });
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
