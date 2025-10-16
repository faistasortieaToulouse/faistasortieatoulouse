'use client';

import React, { useState, createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, X } from 'lucide-react'; 

// Schéma de validation
const formSchema = z.object({
  userPreferences: z.string().min(10, 'Veuillez décrire vos préférences avec plus de détails.'),
});

// -----------------------------------------------------
// MOCK DES UTILS ET DÉPENDANCES POUR LA COMPILATION EN UN SEUL FICHIER
// -----------------------------------------------------

// MOCK: Fonction utilitaire cn (classnames)
const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');

// MOCK: class-variance-authority cva (très simplifié pour le Toast)
const cva = (base: string, { variants, defaultVariants }: { variants: any, defaultVariants: any }) => {
    return ({ variant }: { variant: string }) => {
        if (variant === 'destructive') {
            return cn(base, 'group border-red-500 bg-red-500 text-white');
        }
        return cn(base, 'border bg-white text-gray-900');
    };
};

// Type pour les props génériques de style
type ComponentProps = { children: React.ReactNode, className?: string };

// -----------------------------------------------------
// 1. COMPOSANTS UI DE BASE (Card, Button, Textarea, Skeleton, Form Mocks)
// -----------------------------------------------------

// 1.1. Button (avec gestion du style de chargement/désactivé)
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

// 1.2. Card Structure
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

// 1.3. Textarea
const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
    <textarea
        ref={ref}
        className={cn('flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] transition duration-150', className)}
        {...props}
    />
));

// 1.4. Form Components (Simplifié pour l'utilisation directe de register)
const Form = ({ children }: ComponentProps) => <>{children}</>;
const FormItem = ({ children, className }: ComponentProps) => <div className={cn('space-y-1', className)}>{children}</div>;
const FormLabel = ({ children, className }: ComponentProps) => <label className={cn('text-sm font-medium leading-none mb-1 block', className)}>{children}</label>;
const FormControl = ({ children }: ComponentProps) => <>{children}</>;
const FormMessage = ({ children, className }: ComponentProps) => <p className={cn('text-sm font-medium text-red-500 mt-1', className)}>{children}</p>;

// 1.5. Skeleton
const Skeleton = ({ className }: { className?: string }) => (
    <div className={cn('animate-pulse rounded-md bg-gray-200 dark:bg-gray-700', className)} />
);


// -----------------------------------------------------
// 2. SYSTÈME DE TOAST COMPLET
// -----------------------------------------------------

const ToastPrimitives = {
    Provider: ({ children }: ComponentProps) => <>{children}</>,
    Viewport: React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(({ className, children, ...props }, ref) => (
        <div ref={ref} className={cn("fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]", className)} {...props}>
            {children}
        </div>
    )),
    Root: React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(({ className, children, ...props }, ref) => {
        const rootRef = useRef<HTMLDivElement>(null);
        return (
            <div ref={rootRef} className={cn("group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg", className)} {...props}>
                {children}
            </div>
        );
    }),
    Title: React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(({ className, children, ...props }, ref) => (
        <div ref={ref} className={cn("text-sm font-semibold", className)} {...props}>{children}</div>
    )),
    Description: React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(({ className, children, ...props }, ref) => (
        <div ref={ref} className={cn("text-sm opacity-90", className)} {...props}>{children}</div>
    )),
    Close: React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>(({ className, children, onClick, ...props }, ref) => (
        <button ref={ref} className={cn("absolute right-2 top-2 rounded-md p-1 text-gray-500 transition-opacity hover:text-gray-900 focus:opacity-100", className)} onClick={onClick} {...props}>
            {children || <X className="h-4 w-4" />}
        </button>
    )),
    Action: React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>(({ className, children, ...props }, ref) => (
        <button ref={ref} className={cn("inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium", className)} {...props}>
            {children}
        </button>
    )),
};

type ToastVariant = 'default' | 'destructive';
let TOAST_COUNT = 0;
function generateId() {
    return `toast-${TOAST_COUNT++}`;
}

type Toast = {
    id: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    variant?: ToastVariant;
    duration?: number;
    action?: React.ReactElement<typeof ToastPrimitives.Action>;
};

type ActionType =
    | { type: 'ADD_TOAST'; toast: Toast }
    | { type: 'DISMISS_TOAST'; toastId?: string };

const defaultToastOptions: Partial<Toast> = {
    duration: 5000,
};

const toastReducer = (state: Toast[], action: ActionType): Toast[] => {
    switch (action.type) {
        case 'ADD_TOAST':
            return [action.toast, ...state];
        case 'DISMISS_TOAST':
            const { toastId } = action;
            if (toastId) {
                return state.filter(t => t.id !== toastId);
            }
            return state;
        default:
            return state;
    }
};

const ToastContext = createContext<{ toasts: Toast[]; toast: (props: Partial<Toast>) => { id: string }; dismiss: (toastId?: string) => void } | undefined>(undefined);

function ToastProvider({ children }: ComponentProps) {
    const [state, dispatch] = useReducer(toastReducer, []);
    const ref = useRef<number[]>([]);

    const dismiss = (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId });

    const toast = (props: Partial<Toast>) => {
        const id = generateId();
        const toast = { ...defaultToastOptions, ...props, id };
        dispatch({ type: 'ADD_TOAST', toast });

        if (toast.duration) {
            const timeout = setTimeout(() => dismiss(id), toast.duration);
            ref.current.push(timeout as unknown as number);
        }

        return { id };
    };

    useEffect(() => {
        return () => {
            ref.current.forEach(timeout => clearTimeout(timeout));
        };
    }, []);

    const value = { toasts: state, toast, dismiss };

    return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) { 
        return { toasts: [], toast: (props: Partial<Toast>) => { 
            console.warn("[Toast Mock] Toast called outside of provider:", props);
            return { id: generateId() };
        }, dismiss: () => {} };
    }
    return context;
};

const toastVariants = cva(
    "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all",
    {
        variants: {
            variant: {
                default: "border bg-white text-gray-900",
                destructive: "destructive group border-red-500 bg-red-500 text-white",
            },
        },
        defaultVariants: { variant: "default" },
    }
);

const Toast = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Root>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & { variant?: ToastVariant, onOpenChange?: (open: boolean) => void }
>(({ className, variant, onOpenChange, ...props }, ref) => {
    const isDestructive = variant === 'destructive';
    
    return (
        <ToastPrimitives.Root
            ref={ref}
            className={cn(
                toastVariants({ variant }), 
                className,
                isDestructive ? 'border-red-600' : 'border-gray-200'
            )}
            {...props}
        >
            {props.children}
        </ToastPrimitives.Root>
    );
});
Toast.displayName = 'Toast';

const ToastClose = ({ id }: { id: string }) => {
    const { dismiss } = useToast();
    return (
        <ToastPrimitives.Close
            onClick={() => dismiss(id)}
        />
    );
};

function Toaster() {
    const { toasts } = useToast();

    return (
        <ToastPrimitives.Provider>
            {toasts.map(function ({ id, title, description, action, variant, ...props }) {
                return (
                    <Toast key={id} id={id} variant={variant} {...props}>
                        <div className="grid gap-1">
                            {title && <ToastPrimitives.Title>{title}</ToastPrimitives.Title>}
                            {description && (
                                <ToastPrimitives.Description>{description}</ToastPrimitives.Description>
                            )}
                        </div>
                        {action}
                        <ToastClose id={id} />
                    </Toast>
                );
            })}
            <ToastPrimitives.Viewport className='fixed top-0 right-0 z-[100]' />
        </ToastPrimitives.Provider>
    );
}

// -----------------------------------------------------
// 3. LOGIQUE DE L'API GEMINI
// -----------------------------------------------------

// L'API_KEY est laissée vide, car elle est censée être fournie par l'environnement Canvas
const API_KEY = ''; 
const MODEL_NAME = 'gemini-2.5-flash-preview-09-2025';

// CONSTRUIRE L'URL EN TANT QUE FONCTION POUR GÉRER L'ABSENCE DE CLÉ
const buildApiUrl = () => {
    let url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;
    if (API_KEY && API_KEY !== '') {
        url += `?key=${API_KEY}`;
    }
    return url;
};

// Fonction utilitaire pour l'attente
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Type pour les props du composant
interface AiRecommendationsProps {
  eventData: string;
}

// -----------------------------------------------------
// 4. COMPOSANT PRINCIPAL
// -----------------------------------------------------

export function AiRecommendations({ eventData }: AiRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
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
    console.log("--- Démarrage de la requête Gemini ---");
    console.log("Préférences utilisateur:", values.userPreferences);
    
    // Obtenir l'URL de l'API (avec ou sans le paramètre ?key)
    const apiUrl = buildApiUrl();
    console.log(`URL d'appel: ${apiUrl}`);

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
        console.log(`Tentative d'API n°${attempts}...`);

        const response = await fetch(apiUrl, { // Utilisation de l'URL construite
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        console.log(`Réponse API reçue (Statut: ${response.status})`);
        
        // --- LOGIQUE POUR CASSER LA BOUCLE EN CAS D'ERREUR D'AUTH/CLIENT (403/400) ---
        if (response.status === 403) {
             const errorText = await response.text();
             console.error(`Erreur d'authentification permanente (403 Forbidden):`, errorText);
             // JETER UNE ERREUR SPÉCIFIQUE
             throw new Error(`Erreur d'authentification (Statut 403). L'API exige une identité d'appelant établie.`);
        }
        
        if (response.status === 400) {
             const errorText = await response.text();
             console.error(`Erreur client (400 Bad Request):`, errorText);
             throw new Error(`Erreur de requête (Statut 400). Problème de format ou de paramètre envoyé.`);
        }
        // --------------------------------------------------------------------------

        if (response.ok) {
          try {
            result = await response.json();
            success = true;
          } catch (e) {
            console.error("Erreur de parsing JSON de la réponse:", e);
            throw new Error("La réponse de l'API n'était pas un JSON valide.");
          }
        } else {
          // Logique de backoff exponentiel (uniquement pour les erreurs 5xx ou 429 - erreurs temporaires)
          const errorText = await response.text();
          console.error(`Erreur serveur temporaire (${response.status}):`, errorText);

          if (attempts < maxRetries) {
            await sleep(Math.pow(2, attempts) * 1000);
          } else {
            throw new Error(`Échec de l'appel API après ${maxRetries} tentatives. Dernier statut: ${response.status}`);
          }
        }
      }

      // Si la boucle s'est terminée sans succès (par exemple, max retries atteint)
      if (!success) {
         throw new Error("Toutes les tentatives d'appel API ont échoué.");
      }
      
      // Extraction des résultats
      if (result && result.candidates && result.candidates.length > 0) {
        const text = result.candidates[0].content?.parts?.[0]?.text || 'Impossible de générer des recommandations.';
        setRecommendations(text);
        console.log("Recommandations générées avec succès.");
      } else {
        console.error("Réponse de l'API reçue, mais le contenu est vide ou inattendu.", result);
        throw new Error('Réponse vide ou structure inattendue de l\'API.');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      console.error('Erreur CRITIQUE lors de l\'obtention des recommandations IA:', error);
      
      // Mise à jour du Toast pour afficher l'erreur
      toast({
        variant: 'destructive',
        title: 'Échec de la Recommandation',
        description: `Détail : ${errorMessage}`,
      });

    } finally {
      setIsLoading(false);
      console.log("--- Fin de la requête Gemini ---");
    }
  }

  // --- RENDU DU COMPOSANT ---
  return (
    <Card className="max-w-xl mx-auto my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
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
                  {...form.register("userPreferences")} // Utilisation directe de register
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
// Le wrapper qui contient le Provider et le Toaster
// -----------------------------------------------------

export default function AppWrapper(props: AiRecommendationsProps) {
    return (
        <ToastProvider>
            <AiRecommendations {...props} />
            <Toaster /> 
        </ToastProvider>
    );
}
