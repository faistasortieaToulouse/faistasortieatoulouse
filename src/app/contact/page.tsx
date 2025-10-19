'use client';

// Important: Installation de la bibliothèque nécessaire côté serveur !
// N'oubliez pas de faire : npm install altcha-lib

export const dynamic = 'force-dynamic';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Déclaration pour TypeScript/React du Web Component altcha-widget
// Note: Ceci est nécessaire car 'altcha-widget' n'est pas une balise HTML standard
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'altcha-widget': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        name?: string;
        maxnumber?: string;
        theme?: 'light' | 'dark' | 'auto';
        auto?: 'onsubmit'; // Utilisation pour déclencher la vérification au submit
        'challenge-url'?: string; // Optionnel pour Sentinel
      }, HTMLElement>;
    }
  }
}

// --- Validation du formulaire ---
const contactFormSchema = z.object({
  name: z.string().min(2, 'Nom trop court'),
  email: z.string().email('Email invalide'),
  subject: z.string().min(5, 'Sujet trop court'),
  message: z.string().min(10, 'Message trop court'),
  // Le champ s'appelle 'altcha' par défaut
  altcha: z
    .string()
    .min(1, { message: 'Veuillez compléter la vérification ALTCHA.' }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  
  // État pour s'assurer que le script ALTCHA est chargé avant le rendu du widget
  const [scriptLoaded, setScriptLoaded] = useState(false);	

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      altcha: '', // Champ pour le payload ALTCHA
    },
  });

  const altchaError = form.formState.errors['altcha']?.message;

  // --- Charger le script ALTCHA une seule fois ---
  // Nous utilisons le CDN ici pour la simplicité de l'Open Source
  useEffect(() => {
    // Vérifie si le script est déjà là pour éviter de le recharger
    if (!document.querySelector('script[data-altcha-loaded]')) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/gh/altcha-org/altcha@main/dist/altcha.min.js';
      script.async = true;
      script.defer = true;
      script.type = 'module';
      script.setAttribute('data-altcha-loaded', 'true'); // Marqueur pour ne pas recharger

      // Une fois le script chargé, nous pouvons rendre le Web Component
      script.onload = () => {
        setScriptLoaded(true);
        // On doit manuellement indiquer à React que le champ caché 'altcha' est prêt.
        // C'est un contournement des formulaires contrôlés pour les Web Components.
        const altchaWidget = document.querySelector('altcha-widget');
        if(altchaWidget) {
            altchaWidget.addEventListener('verified', (event: any) => {
                // ALTCHA a résolu le PoW et a généré le payload.
                // On met à jour le champ 'altcha' du formulaire React Hook Form
                form.setValue('altcha', event.detail.payload, { shouldValidate: true });
            });
            altchaWidget.addEventListener('unverified', () => {
                form.setValue('altcha', '', { shouldValidate: true });
            });
        }
      };
      
      document.body.appendChild(script);
    } else {
        setScriptLoaded(true);
    }
  }, [form]); // Ajout de 'form' dans les dépendances (meilleure pratique)

  // --- Envoi du formulaire ---
  const onSubmit = useCallback(
    async (data: ContactFormValues) => {
      // 1. Déclenche le PoW si auto="onsubmit" (non nécessaire si le widget est en mode auto)
      //    ALTCHA gère le PoW, nous vérifions simplement le résultat du PoW dans le champ 'altcha'
      
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await res.json();

        if (res.ok) {
          toast({ title: 'Message envoyé avec succès 🎉' });
          form.reset();
        } else {
          toast({
            variant: 'destructive',
            title: 'Erreur',
            description: result.message || 'Échec de l’envoi.',
          });
        }

        // Le widget ALTCHA se réinitialise généralement lui-même après l'envoi, 
        // ou la prochaine interaction de l'utilisateur déclenchera un nouveau PoW si nécessaire.
        
      } catch (err) {
        console.error(err);
        toast({
          variant: 'destructive',
          title: 'Erreur réseau',
          description: 'Impossible de contacter le serveur.',
        });
      }
    },
    [form, toast]
  );
  
  // Optionnel: Afficher un loader si le script n'est pas chargé
  if (!scriptLoaded) {
      return (
        <div className="p-6 text-blue-500">
            Chargement du module de vérification...
        </div>
      );
  }

  // RETURN PRINCIPAL
  return (
    <div className="p-4 md:p-8">
      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold text-primary">
          Nous contacter
        </h1>
        <p className="mt-2 text-muted-foreground">
          Une question, une suggestion ? N&apos;hésitez pas à nous envoyer un message.
        </p>
      </header>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Formulaire de contact</CardTitle>
          <CardDescription>Remplissez les champs ci-dessous.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
              
              {/* CHAMPS STANDARDS (inchangés) */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Jean Dupont" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="jean@example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sujet</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Votre sujet" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={5} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* ------------------------------------------- */}
              {/* INTÉGRATION ALTCHA (Remplace Turnstile) */}
              {/* ------------------------------------------- */}
              
              {/* Champ caché pour ALTCHA - Géré par RHF */}
              <input type="hidden" {...form.register('altcha')} />	

              <div className="flex flex-col items-center pt-2">
                {/* Le Web Component ALTCHA.
                    - name="altcha" est essentiel pour la soumission.
                    - maxnumber augmente la difficulté (1 000 000 est une bonne base).
                    - 'challenge-url' est omis, forçant le mode PoW local.
                */}
                <altcha-widget	
                    name="altcha"	
                    maxnumber="1000000"	
                    theme="auto"
		    challenge-url="/api/altcha"  // ✅ ajout essentiel
                />

                {altchaError && (
                  <p className="text-sm text-destructive mt-2">{altchaError}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                <Send className="mr-2 h-4 w-4" />
                {form.formState.isSubmitting ? 'Envoi...' : 'Envoyer'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
