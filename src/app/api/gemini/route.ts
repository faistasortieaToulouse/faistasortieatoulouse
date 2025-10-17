// /app/api/gemini/route.ts
// C'est ici que l'appel secret à l'API Gemini est effectué.

import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

// ⚠️ La variable d'environnement qui contient le JSON de votre Compte de Service
const SERVICE_ACCOUNT_KEY = process.env.GEMINI_SERVICE_ACCOUNT_KEY; 

if (!SERVICE_ACCOUNT_KEY) {
  // Cette erreur sera visible dans les logs de Vercel/Next.js
  console.error("Erreur de configuration : GEMINI_SERVICE_ACCOUNT_KEY est manquant.");
}

// Initialisation du client Google GenAI
let ai: GoogleGenAI | null = null;
try {
    if (SERVICE_ACCOUNT_KEY) {
        // Le contenu de la variable est le JSON de la clé du compte de service
        const credentials = JSON.parse(SERVICE_ACCOUNT_KEY);
        
        // Initialisation avec les crédentiels
        ai = new GoogleGenAI({ credentials });
    }
} catch (e) {
    console.error("Erreur lors du parsing de la clé JSON du compte de service :", e);
}


export async function POST(request: Request) {
  if (!ai) {
    // Erreur si la configuration de la clé a échoué
    return new NextResponse("Configuration d'API Gemini manquante ou invalide.", { status: 500 });
  }

  try {
    // On récupère les données envoyées par le frontend
    const { prompt, eventData } = await request.json(); 
    
    if (!prompt) {
        return new NextResponse("Le prompt (requête utilisateur) est requis.", { status: 400 });
    }
    
    // Contexte enrichi pour Gemini
    const finalPrompt = `
      Je suis à Toulouse et je cherche une recommandation de sortie.
      Mon profil/ma requête : "${prompt}"
      Voici les événements Discord actuellement disponibles, tu dois te baser sur ces données si tu peux :
      ${eventData}
      
      Analyse ces informations et suggère la meilleure sortie à Toulouse. La réponse doit être directe et conviviale.
    `;

    // Appel à l'API Gemini
    const response = await ai.generateContent({
      model: "gemini-2.5-flash", // Modèle rapide et polyvalent
      contents: finalPrompt,
    });

    // Retourner uniquement le texte généré au frontend
    return NextResponse.json({ result: response.text });
  } catch (error) {
    console.error("Erreur lors de l'appel à Gemini :", error);
    return new NextResponse("Erreur interne du serveur lors de la génération IA.", { status: 500 });
  }
}
