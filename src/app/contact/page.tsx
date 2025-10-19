'use client';

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

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: any) => string;
      reset: (id?: string | HTMLElement) => void;
    };
  }
}

// --- Validation du formulaire ---
const contactFormSchema = z.object({
  name: z.string().min(2, 'Nom trop court'),
  email: z.string().email('Email invalide'),
  subject: z.string().min(5, 'Sujet trop court'),
  message: z.string().min(10, 'Message trop court'),
  'cf-turnstile-response': z
    .string()
    .min(1, { message: 'Veuillez compléter la vérification anti-bot.' }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

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

  // --- SITE KEY Turnstile
  const siteKeyRaw = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;
  const siteKey = typeof siteKeyRaw === 'string' ? siteKeyRaw : '';

  const turnstileError = form.formState.errors['cf-turnstile-response']?.message;

  // --- Charger le script Turnstile une seule fois
  useEffect(() => {
    if (!siteKey) {
      console.error('⚠️ Clé publique Turnstile manquante ou invalide.');
      return;
    }

    if (!window.turnstile) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => setScriptLoaded(true);
      document.body.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, [siteKey]);

  // --- Rendre le widget une seule fois
  useEffect(() => {
    if (
      scriptLoaded &&
      window.turnstile &&
      turnstileRef.current &&
      !widgetIdRef.current
    ) {
      try {
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: siteKey,
          theme: 'auto',
          callback: (token: string) =>
            form.setValue('cf-turnstile-response', token, { shouldValidate: true }),
          'expired-callback': () =>
            form.setValue('cf-turnstile-response', '', { shouldValidate: true }),
          'error-callback': () =>
            form.setValue('cf-turnstile-response', '', { shouldValidate: true }),
        });
      } catch (err) {
        console.error('Erreur lors du rendu Turnstile:', err);
      }
    }
  }, [scriptLoaded, form, siteKey]);

  // --- Envoi du formulaire
  const onSubmit = useCallback(
    async (data: ContactFormValues) => {
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

        // --- Réinitialiser Turnstile après l’envoi
        if (window.turnstile && widgetIdRef.current) {
          window.turnstile.reset(widgetIdRef.current);
        }
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

  // --- Message si la clé publique est manquante
  if (!siteKey) {
    return (
      <div className="p-6 text-red-500">
        Erreur de configuration : clé publique Turnstile manquante.
      </div>
    );
  }

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

              {/* Champ caché pour Turnstile */}
              <input type="hidden" {...form.register('cf-turnstile-response')} />

              {/* Widget Turnstile */}
              <div className="flex flex-col items-center pt-2">
                <div ref={turnstileRef} className="cf-turnstile" />
                {turnstileError && (
                  <p className="text-sm text-destructive mt-2">{turnstileError}</p>
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
