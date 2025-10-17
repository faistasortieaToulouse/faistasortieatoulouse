// /app/api/gemini/route.ts
// Assurez-vous d'avoir installé le package @google/genai

import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

// ⚠️ Variable d'environnement définie sur Vercel
const SERVICE_ACCOUNT_KEY = process.env.GEMINI_SERVICE_ACCOUNT_KEY; 

if (!SERVICE_ACCOUNT_KEY) {
  console.error("Configuration manquante : GEMINI_SERVICE_ACCOUNT_KEY n'est pas définie. Tentative d'initialisation sans succès.");
}

let ai: GoogleGenAI | null = null;
let initError: string | null = null;

try {
    if (SERVICE_ACCOUNT_KEY) {
        // Tente de parser le JSON de la clé de service
        const credentials = JSON.parse(SERVICE_ACCOUNT_KEY);
        ai = new GoogleGenAI({ credentials });
    } else {
        initError = "Clé de compte de service (GEMINI_SERVICE_ACCOUNT_KEY) manquante.";
    }
} catch (e) {
    // Échec du parsing JSON
    initError = "Erreur de parsing de la clé de service JSON. Vérifiez le format.";
    console.error(`[AI_INIT_ERROR] ${initError}:`, e);
}


export async function POST(request: Request) {
  // 1. Vérification de l'initialisation (Clé manquante ou mal parsée)
  if (!ai) {
    // Si l'initialisation a échoué (parsing JSON ou clé absente)
    console.error(`[AI_RUNTIME_ERROR] Échec de l'initialisation du client Gemini. Raison: ${initError || 'Inconnue'}`);
    return new NextResponse(`Erreur de configuration du serveur IA: ${initError || 'Client non initialisé.'}`, { status: 500 });
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

    // 2. Appel à l'API Gemini
    const response = await ai.generateContent({
      model: "gemini-2.5-flash", 
      contents: finalPrompt,
    });

    return NextResponse.json({ result: response.text });
  } catch (error: any) {
    // 3. Gestion des erreurs Gemini (403, 400, etc.)
    console.error("Erreur lors de l'appel à Gemini (Status du service Gemini):", error.status, error.message);
    
    // Tente d'extraire le statut HTTP si disponible, sinon utilise 500
    const status = error.status || 500;
    const message = `Erreur IA: ${error.message || 'Le service Gemini a renvoyé une erreur.'}`;

    return new NextResponse(message, { status: status });
  }
}
