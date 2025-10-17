// src/components/AiRecommendations.tsx (CODE CORRIGÉ)
'use client';

import React, { useState, createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, X } from 'lucide-react'; 

// --- Interface pour les props ---
interface AiRecommendationsProps {
  eventData: string; // La prop reçue de DashboardClient
}

// Schéma de validation
const formSchema = z.object({
  userPreferences: z.string().min(10, 'Veuillez décrire vos préférences avec plus de détails.'),
});

// -----------------------------------------------------
// MOCK DES UTILS ET DÉPENDANCES POUR LA COMPILATION EN UN SEUL FICHIER
// -----------------------------------------------------
// [Le code de MOCK des composants UI (cn, cva, Button, Card, Textarea, Form, Skeleton, Toast) reste inchangé]
// ... (omission du code mock pour la concision) ...

// -----------------------------------------------------
// 3. COMPOSANT PRINCIPAL AiRecommendations (MODIFIÉ)
// -----------------------------------------------------

// [Réimplémentez ici votre système de Toast et useToast si vous le souhaitez]
const useToast = () => { return { toast: (p: any) => console.log('TOAST:', p) }; }; 

export function AiRecommendations({ eventData }: AiRecommendationsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string | null>('Décrivez vos goûts pour obtenir une suggestion !');
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userPreferences: '',
    },
  });

  // 💥 FONCTION ONSUBMIT CORRIGÉE AVEC APPEL AU BACKEND 💥
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setRecommendations('L\'IA analyse les données... veuillez patienter.');
    
    toast({
        title: "Recherche en cours 🤖",
        description: "Analyse de vos préférences et des événements à Toulouse...",
    });

    try {
      // ⚠️ Appel à votre API Route locale sécurisée ⚠️
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: values.userPreferences,
          eventData: eventData, // ENVOI des données Discord au backend pour le contexte
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Erreur du service interne (Status ${response.status}): ${errorBody}`);
      }

      const data = await response.json();
      setRecommendations(data.result);
      
      toast({
        title: "Recommandation trouvée ! 🎉",
        description: "Votre sortie idéale est prête.",
      });

    } catch (error) {
      console.error("Erreur lors de l'appel à l'API Gemini :", error);
      setRecommendations('Désolé, une erreur s\'est produite lors de la génération IA. Le développeur est averti.');
      toast({
        title: "Erreur de connexion",
        description: "Échec de l'appel IA. Vérifiez les logs.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Card className="w-full">
      {/* ... (Le reste du JSX, CardHeader, CardContent, Form) ... */}
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
          <Sparkles className="w-6 h-6" />
          Recommandations d'Événements IA
        </CardTitle>
        <CardDescription>
          Décrivez vos goûts et laissez l'IA vous suggérer des sorties à Toulouse !
        </CardDescription>
      </CardHeader>
      <CardContent>
        
        <div className="space-y-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormItem>
              <FormLabel>Vos préférences</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ex: J'aime les concerts de rock, les bars à vin et les expositions d'art moderne..."
                  {...form.register("userPreferences")}
                  disabled={isLoading}
                />
              </FormControl>
              {form.formState.errors.userPreferences && (
                <FormMessage>{form.formState.errors.userPreferences.message}</FormMessage>
              )}
            </FormItem>

            <Button type="submit" disabled={isLoading} className="w-full">
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
        </div>

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

// [Reste du code (AppWrapper, Toaster) inchangé]
