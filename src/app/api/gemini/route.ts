// /app/api/gemini/route.ts
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
let initError: string | null = null;

try {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY non définie dans les variables d'environnement.");
  }

  // ✅ Initialisation conforme à la version actuelle du SDK
  ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
} catch (e) {
  initError = "Impossible d'initialiser le client Gemini.";
  console.error(`[AI_INIT_ERROR] ${initError}`, e);
  ai = null;
}

export async function POST(request: Request) {
  if (!ai) {
    return new NextResponse(
      `Erreur de configuration du serveur IA: ${initError || "Client non initialisé."}`,
      { status: 500 }
    );
  }

  try {
    const { prompt, eventData } = await request.json();

    if (!prompt) {
      return new NextResponse("Le prompt (requête utilisateur) est requis.", {
        status: 400,
      });
    }

    const finalPrompt = `
      Je suis à Toulouse et je cherche une recommandation de sortie.
      Mon profil/ma requête : "${prompt}"
      Événements Discord:
      ${eventData}

      Ta réponse doit être directe, conviviale, et ne doit pas inclure les données Discord brutes.
    `;

    const response = await ai.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
    });

    return NextResponse.json({ result: response.response.text() });
  } catch (error: any) {
    console.error("Erreur lors de l'appel à Gemini:", error);
    const status = error.status || 500;
    const message = `Erreur IA: ${error.message || "Le service Gemini a renvoyé une erreur."}`;
    return new NextResponse(message, { status });
  }
}
