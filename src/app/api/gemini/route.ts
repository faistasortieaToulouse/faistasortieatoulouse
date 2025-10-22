import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const SERVICE_ACCOUNT_KEY = process.env.GEMINI_SERVICE_ACCOUNT_KEY;

let ai: GoogleGenAI | null = null;
let initError: string | null = null;

try {
  if (SERVICE_ACCOUNT_KEY) {
    const credentials = JSON.parse(SERVICE_ACCOUNT_KEY);

    // ✅ Initialisation correcte pour cette version du SDK
    ai = new GoogleGenAI({ credentials });
  } else {
    initError = "Clé de compte de service GEMINI_SERVICE_ACCOUNT_KEY manquante.";
    console.error(initError);
  }
} catch (e) {
  initError = "Erreur de parsing de la clé JSON.";
  console.error(`[AI_INIT_ERROR] ${initError}:`, e);
}

export async function POST(request: Request) {
  if (!ai) {
    console.error(`[AI_RUNTIME_ERROR] Client Gemini non initialisé. Raison: ${initError}`);
    return new NextResponse(`Erreur de configuration du serveur IA: ${initError || 'Client non initialisé.'}`, { status: 500 });
  }

  try {
    const { prompt, eventData } = await request.json(); 

    if (!prompt) {
      return new NextResponse("Le prompt (requête utilisateur) est requis.", { status: 400 });
    }

    const finalPrompt = `
      Je suis à Toulouse et je cherche une recommandation de sortie.
      Mon profil/ma requête : "${prompt}"
      Événements Discord:
      ${eventData}

      Ta réponse doit être directe, conviviale, et ne doit pas inclure les données Discord brutes.
    `;

    const response = await ai.generateContent({
      model: "gemini-2.5-flash",
      contents: finalPrompt,
    });

    return NextResponse.json({ result: response.text });
  } catch (error: any) {
    console.error("Erreur lors de l'appel à Gemini:", error.status, error.message);
    const status = error.status || 500;
    const message = `Erreur IA: ${error.message || 'Le service Gemini a renvoyé une erreur.'}`;
    return new NextResponse(message, { status });
  }
}
