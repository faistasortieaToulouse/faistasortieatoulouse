// /app/api/gemini/route.ts
// Assurez-vous d'avoir installé le package @google/genai

import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

// ⚠️ Variable d'environnement définie sur Vercel
const SERVICE_ACCOUNT_KEY = process.env.GEMINI_SERVICE_ACCOUNT_KEY; 

if (!SERVICE_ACCOUNT_KEY) {
  console.error("Configuration manquante : GEMINI_SERVICE_ACCOUNT_KEY n'est pas définie.");
}

let ai: GoogleGenAI | null = null;
try {
    if (SERVICE_ACCOUNT_KEY) {
        const credentials = JSON.parse(SERVICE_ACCOUNT_KEY);
        ai = new GoogleGenAI({ credentials });
    }
} catch (e) {
    console.error("Erreur lors du parsing de la clé JSON du compte de service :", e);
}


export async function POST(request: Request) {
  if (!ai) {
    return new NextResponse("Configuration d'API Gemini manquante ou invalide.", { status: 500 });
  }

  try {
    // Récupération des données du frontend
    const { prompt, eventData } = await request.json(); 
    
    if (!prompt) {
        return new NextResponse("Le prompt (requête utilisateur) est requis.", { status: 400 });
    }
    
    // Prompt enrichi
    const finalPrompt = `
      Je suis à Toulouse et je cherche une recommandation de sortie.
      Mon profil/ma requête : "${prompt}"
      Voici les événements Discord actuellement disponibles, analyse-les pour une suggestion. Si aucun n'est pertinent, propose une idée locale originale :
      Événements Discord:
      ${eventData}
      
      Ta réponse doit être directe, conviviale, et ne doit pas inclure les données Discord brutes.
    `;

    // Appel à l'API Gemini
    const response = await ai.generateContent({
      model: "gemini-2.5-flash", 
      contents: finalPrompt,
    });

    return NextResponse.json({ result: response.text });
  } catch (error) {
    console.error("Erreur lors de l'appel à Gemini :", error);
    return new NextResponse("Erreur interne du serveur lors de la génération IA.", { status: 500 });
  }
}
