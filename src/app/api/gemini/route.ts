// src/app/api/gemini/route.ts
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// ✅ Clé API définie dans ton environnement (Vercel)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
let initError: string | null = null;

try {
  if (GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  } else {
    initError = "Clé GEMINI_API_KEY manquante.";
    console.error(initError);
  }
} catch (e) {
  initError = "Erreur d'initialisation du client Gemini.";
  console.error(`[AI_INIT_ERROR] ${initError}:`, e);
}

export async function POST(request: Request) {
  if (!ai) {
    return new NextResponse(
      `Erreur de configuration IA : ${initError || "Client non initialisé."}`,
      { status: 500 }
    );
  }

  try {
    const { prompt, eventData } = await request.json();

    if (!prompt) {
      return new NextResponse("Le champ 'prompt' est requis.", { status: 400 });
    }

    const finalPrompt = `
      Je suis à Toulouse et je cherche une recommandation de sortie.
      Mon profil/ma requête : "${prompt}"
      Événements Discord:
      ${eventData}

      Ta réponse doit être directe, conviviale et sans inclure les données Discord brutes.
    `;

    // ✅ Nouvelle syntaxe pour le SDK @google/genai
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
    });

    return NextResponse.json({ result: response.output_text });
  } catch (error: any) {
    console.error("Erreur lors de l'appel à Gemini:", error);
    const status = error.status || 500;
    const message = `Erreur IA: ${error.message || "Le service Gemini a échoué."}`;
    return new NextResponse(message, { status });
  }
}
