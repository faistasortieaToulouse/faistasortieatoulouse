// /app/api/gemini/route.ts
import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

// ⚠️ Le SDK lit automatiquement GOOGLE_APPLICATION_CREDENTIALS
let ai: GoogleGenAI | null = null;

try {
  ai = new GoogleGenAI();
} catch (e) {
  console.error("[AI_INIT_ERROR] Impossible d'initialiser Gemini :", e);
  ai = null;
}

export async function POST(request: Request) {
  if (!ai) {
    return new NextResponse(
      "Client Gemini non initialisé. Vérifiez la variable d'environnement GOOGLE_APPLICATION_CREDENTIALS.",
      { status: 500 }
    );
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
    console.error("Erreur lors de l'appel à Gemini :", error);
    const status = error.status || 500;
    const message = `Erreur IA: ${error.message || 'Le service Gemini a renvoyé une erreur.'}`;
    return new NextResponse(message, { status });
  }
}
