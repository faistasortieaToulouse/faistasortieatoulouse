'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRef, useCallback } from 'react'; // <-- NOUVEL IMPORT

// Déclaration globale pour le type du widget Turnstile (nécessaire pour TypeScript)
declare global {
  interface Window {
    turnstile: {
      reset: (widgetIdOrContainer: string | HTMLElement) => void;
    };
  }
}

// Schéma Zod : AJOUT du champ Turnstile pour la validation
const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
  subject: z.string().min(5, { message: "Le sujet doit contenir au moins 5 caractères." }),
  message: z.string().min(10, { message: "Le message doit contenir au moins 10 caractères." }),
  // Champ Turnstile : requis pour la soumission
  'cf-turnstile-response': z.string().min(1, { message: "Veuillez compléter la vérification anti-bot." }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  // Référence pour pouvoir réinitialiser le widget Turnstile après l'envoi
  const turnstileRef = useRef<HTMLDivElement>(null); 

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      'cf-turnstile-response': '', // Initialisation du champ Turnstile
    },
  });

  const onSubmit = useCallback(async (data: ContactFormValues) => {
    
    // Le token est déjà dans `data['cf-turnstile-response']` grâce à Zod et form.handleSubmit

    try {
        // Envoi des données (y compris le jeton Turnstile) à l'API Route sécurisée
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        
        const result = await response.json();

        if (response.ok) {
            toast({
                title: 'Message envoyé avec succès !',
                description: 'Nous vous répondrons dès que possible.',
            });
            // Réinitialisation du formulaire et du widget après succès
            form.reset({
                name: '',
                email: '',
                subject: '',
                message: '',
                'cf-turnstile-response': '',
            });
            if (window.turnstile && turnstileRef.current) {
                window.turnstile.reset(turnstileRef.current);
            }
        } else {
            // Afficher le message d'erreur du serveur (ex: vérification anti-bot échouée)
            toast({
                variant: 'destructive',
                title: 'Échec de l\'envoi',
                description: result.message || 'Une erreur est survenue lors de l\'envoi du message. Réessayez.',
            });
        }
    } catch (error) {
        console.error("Erreur réseau:", error);
        toast({
            variant: 'destructive',
            title: 'Erreur réseau',
            description: "Impossible de contacter le serveur. Vérifiez votre connexion.",
        });
    }
  }, [form, toast]);


  return (
    <div className="p-4 md:p-8">
      {/* ... (Header inchangé) ... */}
      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold text-primary">Nous contacter</h1>
        <p className="mt-2 text-muted-foreground">
          Une question, une suggestion ? N'hésitez pas à nous envoyer un message.
        </p>
      </header>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Formulaire de contact</CardTitle>
          <CardDescription>
            Remplissez les champs ci-dessous. Votre email de réception est sécurisé.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            {/* IMPORTANT : onSubmit appelle la fonction ASYNCHRONE et SÉCURISÉE */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Votre nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Jean Dupont" {...field} />
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
                    <FormLabel>Votre email</FormLabel>
                    <FormControl>
                      <Input placeholder="jean.dupont@exemple.com" {...field} />
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
                      <Input placeholder="Suggestion pour l'application" {...field} />
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
                    <FormLabel>Votre message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Bonjour, je vous contacte car..."
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* ---------------------------------------------------- */}
              {/* 1. CHAMP CACHÉ RHF POUR LE TOKEN TURNSTILE */}
              <FormField
                control={form.control}
                name="cf-turnstile-response"
                render={({ field }) => (
                  <FormItem>
                    {/* Le message d'erreur s'affichera ici si le jeton manque */}
                    <FormMessage /> 
                    {/* Le champ est caché car le widget lui-même le remplira */}
                    <FormControl>
                      <Input type="hidden" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* 2. WIDGET CLOUDFLARE TURNSTILE */}
              <div className="flex justify-center pt-2">
                <div
                    ref={turnstileRef}
                    className="cf-turnstile"
                    data-sitekey="0x4AAAAAAB67F6RPRZZDOgEg" // <-- REMPLACER !
                    data-theme="auto"
                    // Ces callbacks sont essentiels pour que RHF sache quand le jeton est là
                    data-callback={(token: string) => form.setValue('cf-turnstile-response', token, { shouldValidate: true })}
                    data-error-callback={() => form.setValue('cf-turnstile-response', '', { shouldValidate: true })}
                    data-expired-callback={() => form.setValue('cf-turnstile-response', '', { shouldValidate: true })}
                ></div>
              </div>
              {/* ---------------------------------------------------- */}
              
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                <Send className="mr-2 h-4 w-4" />
                {form.formState.isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
