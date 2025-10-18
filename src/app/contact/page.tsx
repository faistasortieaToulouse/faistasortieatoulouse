'use client';
export const dynamic = 'force-dynamic';

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
import { useRef, useCallback } from 'react';

// --- Déclaration globale pour Turnstile ---
declare global {
  interface Window {
    turnstile: {
      reset: (widgetIdOrContainer: string | HTMLElement) => void;
    };
  }
}

// --- Validation du formulaire ---
const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères.' }),
  email: z.string().email({ message: 'Veuillez entrer une adresse email valide.' }),
  subject: z.string().min(5, { message: 'Le sujet doit contenir au moins 5 caractères.' }),
  message: z.string().min(10, { message: 'Le message doit contenir au moins 10 caractères.' }),
  'cf-turnstile-response': z.string().min(1, { message: 'Veuillez compléter la vérification anti-bot.' }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const turnstileRef = useRef<HTMLDivElement>(null);

  // --- Clé Turnstile côté client ---
  const siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY ?? '';

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      'cf-turnstile-response': '',
    },
  });

  const onSubmit = useCallback(
    async (data: ContactFormValues) => {
      form.clearErrors();
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
          toast({ title: 'Message envoyé avec succès !', description: 'Nous vous répondrons dès que possible.' });
          form.reset();
          if (window.turnstile && turnstileRef.current) {
            window.turnstile.reset(turnstileRef.current);
          }
        } else {
          toast({
            variant: 'destructive',
            title: 'Échec de l’envoi',
            description: result.message || 'Une erreur est survenue lors de l’envoi du message.',
          });
          if (window.turnstile && turnstileRef.current) {
            window.turnstile.reset(turnstileRef.current);
          }
        }
      } catch (error) {
        console.error('Erreur réseau:', error);
        toast({
          variant: 'destructive',
          title: 'Erreur réseau',
          description: "Impossible de contacter le serveur. Vérifiez votre connexion.",
        });
      }
    },
    [form, toast]
  );

  const turnstileError = form.formState.errors['cf-turnstile-response']?.message;

  return (
    <div className="p-4 md:p-8">
      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold text-primary">Nous contacter</h1>
        <p className="mt-2 text-muted-foreground">
          Une question, une suggestion ? N&apos;hésitez pas à nous envoyer un message.
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Champs classiques */}
              {['name', 'email', 'subject'].map((field) => (
                <FormField
                  key={field}
                  control={form.control}
                  name={field as keyof ContactFormValues}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{field === 'name' ? 'Votre nom' : field === 'email' ? 'Votre email' : 'Sujet'}</FormLabel>
                      <FormControl>
                        <Input placeholder={field === 'name' ? 'Jean Dupont' : field === 'email' ? 'jean.dupont@exemple.com' : 'Sujet du message'} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              {/* Message */}
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Votre message</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Bonjour, je vous contacte car..." rows={5} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Champ caché pour Turnstile */}
              <input type="hidden" {...form.register('cf-turnstile-response')} />

              {/* Widget Turnstile */}
              <div className="flex flex-col items-center pt-2">
                <div
                  ref={turnstileRef}
                  className="cf-turnstile"
                  data-sitekey={siteKey}
                  data-theme="auto"
                  data-callback={(token: string) =>
                    form.setValue('cf-turnstile-response', token, { shouldValidate: true })
                  }
                  data-error-callback={() =>
                    form.setValue('cf-turnstile-response', '', { shouldValidate: true })
                  }
                  data-expired-callback={() =>
                    form.setValue('cf-turnstile-response', '', { shouldValidate: true })
                  }
                />
                {turnstileError && <p className="text-sm font-medium text-destructive mt-2">{turnstileError}</p>}
              </div>

              {/* Bouton */}
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
