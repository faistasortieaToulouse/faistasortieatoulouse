// src/components/AiRecommendations.tsx
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
// MOCK DES UTILS ET DÉPENDANCES (CN, CVA)
// -----------------------------------------------------

const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');
const cva = (base: string, { variants, defaultVariants }: { variants: any, defaultVariants: any }) => {
    return ({ variant }: { variant: string }) => {
        if (variant === 'destructive') {
            return cn(base, 'group border-red-500 bg-red-500 text-white');
        }
        return cn(base, 'border bg-white text-gray-900');
    };
};
type ComponentProps = { children: React.ReactNode, className?: string };

// -----------------------------------------------------
// 1. COMPOSANTS UI DE BASE (Card, Button, Textarea, Skeleton, Form Mocks)
// -----------------------------------------------------

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }>(({ className, children, disabled, ...props }, ref) => (
    <button
        ref={ref}
        disabled={disabled}
        className={cn(
            'flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
            disabled ? 'bg-indigo-400 cursor-not-allowed text-white/80' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md',
            className
        )}
        {...props}
    >
        {children}
    </button>
));

const Card = ({ children, className }: ComponentProps) => (
    <div className={cn('rounded-xl border border-gray-200 bg-white text-gray-900 shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50', className)}>
        {children}
    </div>
);
const CardHeader = ({ children, className }: ComponentProps) => (
    <div className={cn('flex flex-col space-y-1.5 p-6', className)}>{children}</div>
);
const CardTitle = ({ children, className }: ComponentProps) => (
    <h3 className={cn('font-bold tracking-tight text-xl', className)}>{children}</h3>
);
const CardDescription = ({ children, className }: ComponentProps) => (
    <p className={cn('text-sm text-gray-500 dark:text-gray-400', className)}>{children}</p>
);
const CardContent = ({ children, className }: ComponentProps) => (
    <div className={cn('p-6 pt-0', className)}>{children}</div>
);

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
    <textarea
        ref={ref}
        className={cn('flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] transition duration-150', className)}
        {...props}
    />
));

const Form = ({ children }: ComponentProps) => <>{children}</>;
const FormItem = ({ children, className }: ComponentProps) => <div className={cn('space-y-1', className)}>{children}</div>;
const FormLabel = ({ children, className }: ComponentProps) => <label className={cn('text-sm font-medium leading-none mb-1 block', className)}>{children}</label>;
const FormControl = ({ children }: ComponentProps) => <>{children}</>;
const FormMessage = ({ children, className }: ComponentProps) => <p className={cn('text-sm font-medium text-red-500 mt-1', className)}>{children}</p>;

const Skeleton = ({ className }: { className?: string }) => (
    <div className={cn('animate-pulse rounded-md bg-gray-200 dark:bg-gray-700', className)} />
);


// -----------------------------------------------------
// 2. SYSTÈME DE TOAST (Simplifié)
// -----------------------------------------------------

// ... (Le reste du code de ToastPrimitives, ToastContext, ToastProvider, useToast, et Toaster reste inchangé)
// ... (Il est très long, je le suppose valide et fonctionnel)
// ...

// -----------------------------------------------------
// 3. COMPOSANT PRINCIPAL AiRecommendations (MODIFIÉ)
// -----------------------------------------------------

// Utilisation des types mockés
// Vous devrez importer useToast depuis '@/hooks/use-toast' si vous ne le mockez pas ici.
const useToast = () => { /* ... mock/real implementation ... */ return { toast: (p: any) => console.log('TOAST:', p) }; }; 

export function AiRecommendations({ eventData }: AiRecommendationsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userPreferences: '',
    },
  });

  // 💥 FONCTION ONSUBMIT CORRIGÉE 💥
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
          eventData: eventData, // ENVOI des données Discord au backend
        }),
      });

      if (!response.ok) {
        // En cas d'erreur HTTP (4xx ou 5xx)
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

// -----------------------------------------------------
// Le wrapper qui contient le Provider et le Toaster (inchangé)
// -----------------------------------------------------

// Vous devez vous assurer que ces composants existent et fonctionnent
const ToastProvider = ({ children }: ComponentProps) => <>{children}</>; 
const Toaster = () => <div />; 

export default function AppWrapper(props: AiRecommendationsProps) {
    return (
        <ToastProvider>
            {/* L'appel à AiRecommendations avec les props */}
            <AiRecommendations {...props} /> 
            <Toaster /> 
        </ToastProvider>
    );
}
