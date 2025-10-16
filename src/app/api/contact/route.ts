// src/app/api/contact/route.ts
import { NextResponse } from 'next/server';

// NOTE : Vous devrez installer un client SMTP comme Nodemailer ou Resend
// Exemple : npm install nodemailer @types/nodemailer
import nodemailer from 'nodemailer'; 

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'support@default.com'; // Votre email de réception
const TURNSTILE_SECRET_KEY = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

// Configuration SMTP (Utilisation d'un service d'e-mail simple, EX: Gmail avec mot de passe d'application)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,     // EX: 'smtp.gmail.com'
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER, // EX: 'votreadresse@gmail.com'
        pass: process.env.SMTP_PASS, // EX: 'votre_mot_de_passe_application_google'
    },
});

export async function POST(request: Request) {
    if (!TURNSTILE_SECRET_KEY) {
        console.error("CLOUDFLARE_TURNSTILE_SECRET_KEY est manquant.");
        return NextResponse.json({ message: 'Erreur de configuration serveur (T-Key)' }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { name, email, subject, message, 'cf-turnstile-response': turnstileToken } = body;

        // 1. VÉRIFICATION DU JETON TURNSTILE (Anti-spam)
        if (!turnstileToken) {
            return NextResponse.json({ message: 'Vérification anti-bot manquante.' }, { status: 400 });
        }

        const verificationData = new URLSearchParams({
            secret: TURNSTILE_SECRET_KEY,
            response: turnstileToken,
            remoteip: request.headers.get('cf-connecting-ip') || '', // IP pour une meilleure vérification
        });

        const verificationResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: verificationData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const verificationResult = await verificationResponse.json();

        if (!verificationResult.success) {
            console.warn("Échec de la vérification Turnstile:", verificationResult['error-codes']);
            return NextResponse.json({ message: 'Vérification anti-bot échouée. Veuillez réessayer.' }, { status: 403 });
        }

        // 2. ENVOI DE L'E-MAIL SÉCURISÉ (via Nodemailer)
        const mailOptions = {
            from: process.env.SMTP_USER, // Doit souvent correspondre à l'utilisateur SMTP
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

        return NextResponse.json({ message: 'Message envoyé avec succès !' }, { status: 200 });

    } catch (error) {
        console.error('Erreur lors du traitement ou de l\'envoi de l\'e-mail:', error);
        return NextResponse.json({ message: 'Erreur interne du serveur lors de l\'envoi.' }, { status: 500 });
    }
}
