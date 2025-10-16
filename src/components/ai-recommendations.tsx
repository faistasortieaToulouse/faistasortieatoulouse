'use client';

import React, { useState } from 'react'; // Importez React pour utiliser useState
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles } from 'lucide-react';

// NOTE: Les imports de composants Shadcn/ui sont conservés mais doivent exister dans le chemin spécifié.
// Dans un environnement à fichier unique, ces composants seraient généralement définis ici.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Textarea } from './ui/textarea';
import { useToast } from './hooks/use-toast'; // Changé à './hooks/use-toast' pour la portabilité
import { Skeleton } from './ui/skeleton';

// Schéma de validation
const formSchema = z.object({
  userPreferences: z.string().min(10, 'Veuillez décrire vos préférences avec plus de détails.'),
});

// -----------------------------------------------------
// LOGIQUE DE L'API GEMINI INTÉGRÉE (Remplacement de recommendEvents)
// -----------------------------------------------------

const API_KEY = ''; // Clé fournie par l'environnement Canvas
const MODEL_NAME = 'gemini-2.5-flash-preview-09-2025';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

// Fonction utilitaire pour l'attente
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Type pour les props du composant
interface AiRecommendationsProps {
  eventData: string;
}

// FIX: Changement d'exportation en 'default' pour résoudre les problèmes d'importation
export default function AiRecommendations({ eventData }: AiRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  // NOTE: On suppose que useToast est disponible via un chemin local ou un mock.
  const { toast } = useToast(); 

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userPreferences: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setRecommendations('');

    // Définition des instructions pour l'IA
    const systemPrompt = `Vous êtes un expert en recommandations d'événements à Toulouse. L'utilisateur a fourni ses préférences. Utilisez les données d'événements structurées suivantes (format JSON) pour trouver les meilleures correspondances. Si les données sont non pertinentes ou absentes, utilisez la recherche Google pour suggérer des activités à jour à Toulouse. Les données d'événements brutes sont: ${eventData}. Fournissez une recommandation claire, détaillée et bien formatée pour l'utilisateur. Répondez en français.`;
    
    const userQuery = `En fonction des préférences de l'utilisateur: "${values.userPreferences}", suggérez des événements ou des sorties.`;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      // Activation de la recherche Google pour des informations actualisées
      tools: [{ "google_search": {} }],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
    };

    let result = null;
    let success = false;
    let attempts = 0;
    const maxRetries = 5;

    try {
      while (attempts < maxRetries && !success) {
        attempts++;
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          result = await response.json();
          success = true;
        } else {
          // Logique de backoff exponentiel pour les erreurs de serveur/taux limite
          if (attempts < maxRetries) {
            await sleep(Math.pow(2, attempts) * 1000);
          } else {
            throw new Error(`Échec de l'appel API après ${maxRetries} tentatives.`);
          }
        }
      }

      if (result && result.candidates && result.candidates.length > 0) {
        const text = result.candidates[0].content?.parts?.[0]?.text || 'Impossible de générer des recommandations.';
        setRecommendations(text);
      } else {
        throw new Error('Réponse vide ou structure inattendue de l\'API.');
      }

    } catch (error) {
      console.error('Erreur lors de l\'obtention des recommandations IA:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible d\'obtenir les recommandations. Veuillez réessayer.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="text-indigo-600 dark:text-indigo-400" />
          Recommandations d'Événements IA
        </CardTitle>
        <CardDescription>
          Décrivez vos goûts et laissez l'IA vous suggérer des sorties à Toulouse !
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userPreferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vos préférences</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: J'aime les concerts de rock, les bars à vin et les expositions d'art moderne..."
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700">
              {isLoading ? (
                <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyse en cours...
                </div>
              ) : 'Obtenir des recommandations'}
            </Button>
          </form>
        </Form>

        {(isLoading || recommendations) && (
          <div className="mt-6">
            <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300">Suggestions pour vous :</h3>
            {isLoading ? (
              <div className="space-y-2 mt-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : (
                <div className="mt-3 whitespace-pre-wrap rounded-lg border border-indigo-200 bg-indigo-50/50 p-4 text-sm text-gray-800 dark:border-indigo-800 dark:bg-gray-800 dark:text-gray-200 shadow-inner">
                    {recommendations}
                </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
