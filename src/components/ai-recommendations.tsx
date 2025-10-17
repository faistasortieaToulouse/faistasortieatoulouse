import React, { useState, useMemo, useCallback } from 'react';

// NOTE IMPORTANTE SUR L'AUTHENTIFICATION:
// L'environnement d'exécution Canvas fournit automatiquement la clé API de l'utilisateur.
// Nous laissons API_KEY à "" (chaîne vide) pour une utilisation sécurisée sans exposer la clé.
// Si vous utilisez Vercel, assurez-vous que votre clé est préfixée par NEXT_PUBLIC_
// (ex: NEXT_PUBLIC_GEMINI_API_KEY) pour qu'elle soit accessible côté client.
const API_KEY = ""; // Laisser vide pour l'injection sécurisée par l'environnement.

const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent";

// --- Mocks pour simuler les dépendances Shadcn/UI/React-Hook-Form/Zod ---
// Dans un environnement réel, ces éléments seraient importés.

/** MOCK: Simule le composant de carte. */
const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 md:p-8 ${className}`}>
    {children}
  </div>
);

/** MOCK: Simule le bouton. */
const Button = ({ children, onClick, disabled, className = '', variant = 'default' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      w-full py-3 px-4 rounded-xl text-lg font-semibold transition duration-200
      ${variant === 'default' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      ${className}
    `}
  >
    {children}
  </button>
);

/** MOCK: Simule le champ de saisie. */
const Input = ({ label, value, onChange, placeholder, type = 'text', disabled }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition duration-150"
    />
  </div>
);

/** MOCK: Simule le composant de zone de texte. */
const Textarea = ({ label, value, onChange, placeholder, rows = 5, disabled }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition duration-150"
    />
  </div>
);

/** MOCK: Simule le composant Toast pour les messages d'erreur/succès. */
const useToast = () => {
  const [toastMessage, setToastMessage] = useState(null);

  const toast = useCallback(({ title, description, variant = 'default' }) => {
    setToastMessage({ title, description, variant });
    setTimeout(() => setToastMessage(null), 5000); // Dissipe après 5 secondes
  }, []);

  const ToastComponent = toastMessage ? (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl transition-opacity duration-300
        ${toastMessage.variant === 'destructive' ? 'bg-red-600 text-white' : 'bg-green-500 text-white'}
      `}
    >
      <div className="font-bold">{toastMessage.title}</div>
      <div className="text-sm">{toastMessage.description}</div>
    </div>
  ) : null;

  return { toast, ToastComponent };
};
// --- Fin des Mocks ---

/**
 * Composant principal de l'application de recommandation IA.
 * Utilise l'API Gemini pour générer des recommandations basées sur les entrées utilisateur.
 */
export const AiRecommendations = () => {
  const [activity, setActivity] = useState('');
  const [context, setContext] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast, ToastComponent } = useToast();

  const handleGenerateRecommendation = useCallback(async () => {
    // La clé API est gérée par l'environnement. Si elle n'est pas fournie, le 403 est attendu.
    
    if (!activity || !context) {
      toast({
        title: "Champs manquants",
        description: "Veuillez décrire l'activité et le contexte pour obtenir une recommandation.",
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setRecommendation('Génération en cours...');

    // Le prompt système assure une réponse courte et en français, parfaite pour le style "recommandation".
    const systemPrompt = "Vous êtes un expert en recommandations créatives. Créez une suggestion unique et inspirante d'environ 150 mots, adaptée à l'activité et au contexte fournis par l'utilisateur. Répondez uniquement avec la recommandation en français. Utilisez un ton enthousiaste.";
    const userQuery = `Activité: ${activity}. Contexte: ${context}. Générez une recommandation détaillée.`;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
    };

    const callApi = async (retryCount = 0) => {
      const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 1000; // Délai exponentiel + jitter
      if (retryCount > 0) {
        console.log(`Tentative de reconnexion n°${retryCount}. Délai: ${delay.toFixed(0)}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      try {
        // L'URL de l'API utilise la clé API vide, comptant sur l'environnement pour l'injection.
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          // Si l'erreur est un 403, cela indique un problème de configuration de la clé au niveau de l'utilisateur.
          if (response.status === 403) {
            throw new Error(`Statut 403: Permission refusée. Vérifiez que la clé API est correctement configurée (GEMINI_API_KEY) et autorisée.`);
          }
          // Pour les autres erreurs, essayez la reconnexion jusqu'à 3 fois
          if (retryCount < 3) {
            return callApi(retryCount + 1);
          }
          throw new Error(`Échec de la requête API avec le statut: ${response.status}`);
        }

        const result = await response.json();
        const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || "Impossible de générer la recommandation. Veuillez réessayer.";

        setRecommendation(generatedText);
        toast({ title: "Succès", description: "Recommandation générée avec succès!", variant: 'default' });

      } catch (error) {
        console.error("Erreur lors de l'appel à l'API Gemini:", error);
        setRecommendation(`Erreur: ${error.message}.`);
        toast({
          title: "Erreur de génération",
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    callApi();
  }, [activity, context, toast]);

  // Utilisez useMemo pour le prompt final affiché à l'utilisateur
  const finalPrompt = useMemo(() => {
    return `Activité: ${activity || '[Non spécifiée]'}\nContexte: ${context || '[Non spécifié]'}`;
  }, [activity, context]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-10 font-sans">
      {ToastComponent}
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white text-center mb-6">
          Générateur de Recommandations IA
        </h1>

        {/* Agencement vertical */}
        <div className="space-y-8">
          
          {/* Section 1: Entrées utilisateur (La Question) */}
          <Card className="border border-indigo-200 dark:border-indigo-800">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">1. Votre Demande à l'IA</h2>
            <div className="space-y-6">
              <Input
                label="Activité ou But (Ex: 'Trouver un film', 'Planifier des vacances', 'Écrire une chanson')"
                value={activity}
                onChange={setActivity}
                placeholder="Décrivez votre objectif principal..."
                disabled={isLoading}
              />
              <Textarea
                label="Contexte (Ex: 'Je suis fatigué et il pleut', 'Budget illimité et besoin d'aventure', 'Style Blues')"
                value={context}
                onChange={setContext}
                placeholder="Ajoutez des détails pour affiner la recommandation..."
                rows={4}
                disabled={isLoading}
              />
              <Button onClick={handleGenerateRecommendation} disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Génération en cours...
                  </span>
                ) : (
                  'Générer la Recommandation'
                )}
              </Button>
            </div>
          </Card>

          {/* Section 2: Résultat de l'IA (S'affiche dessous) */}
          <Card>
            <h2 className="text-2xl font-bold mb-6 text-indigo-600 dark:text-indigo-400">2. Recommandation Personnalisée</h2>
            <div className="min-h-[250px] max-h-[400px] bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 overflow-y-auto">
              {recommendation ? (
                <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                  {recommendation}
                </p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">
                  Entrez vos critères et cliquez sur "Générer" pour recevoir une suggestion unique de l'IA.
                </p>
              )}
            </div>

            {/* Affichage du Prompt pour debug/vérification */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Prompt utilisé (pour référence) :</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    {finalPrompt}
                </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
