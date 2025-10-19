'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCallback, useEffect, useState } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// --- Déclaration du widget ALTCHA ---
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'altcha-widget': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          name?: string;
          theme?: 'light' | 'dark' | 'auto';
          auto?: 'onsubmit';
          challengeurl?: string;
        },
        HTMLElement
      >;
    }
  }
}

// --- Validation du formulaire ---
const contactFormSchema = z.object({
  name: z.string().min(2, 'Nom trop court'),
  email: z.string().email('Email invalide'),
  subject: z.string().min(5, 'Sujet trop court'),
  message: z.string().min(10, 'Message trop court'),
  altcha: z.string().min(1, 'Veuillez compléter la vérification ALTCHA.'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [altchaElement, setAltchaElement] = useState<HTMLElement | null>(null);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: '', email: '', subject: '', message: '', altcha: '' },
  });

  const altchaError = form.formState.errors['altcha']?.message;

  // --- Charger le script ALTCHA ---
useEffect(() => {
  if (!scriptLoaded) return;
  const widget = document.querySelector('altcha-widget');
  if (!widget) return;
  console.log('🔗 ALTCHA widget détecté');
  setAltchaElement(widget as HTMLElement);

  // Ancien listener 'change' (optionnel, peut rester pour compatibilité)
  const onChange = (event?: any) => {
    const value = (widget as any).value ?? event?.detail?.value ?? '';
    form.setValue('altcha', value, { shouldValidate: true });
  };
  widget.addEventListener('change', onChange);

  // ✅ Nouveau listener ALTCHA v5+
  const onVerified = (e: any) => {
    const value = e.detail?.payload;
    if (value) {
      console.log('✅ ALTCHA vérifié, payload reçu :', value);
      form.setValue('altcha', value, { shouldValidate: true });
    }
  };
  const onReset = () => {
    console.log('🔄 ALTCHA réinitialisé');
    form.setValue('altcha', '', { shouldValidate: true });
  };

  widget.addEventListener('verified', onVerified);
  widget.addEventListener('reset', onReset);

  return () => {
    widget.removeEventListener('change', onChange);
    widget.removeEventListener('verified', onVerified);
    widget.removeEventListener('reset', onReset);
  };
}, [scriptLoaded, form]);


  // --- Lier le widget ALTCHA ---
  useEffect(() => {
    if (!scriptLoaded) return;
    const el = document.querySelector('altcha-widget');
    if (!el) return;
    console.log('🔗 ALTCHA widget détecté');
    setAltchaElement(el as HTMLElement);

    const onChange = (event?: any) => {
      const value = (el as any).value ?? event?.detail?.value ?? '';
      if (value) {
        console.log('✅ ALTCHA validé, payload reçu :', value);
        form.setValue('altcha', value, { shouldValidate: true });
      } else {
        console.log('⚠️ ALTCHA réinitialisé ou invalide');
        form.setValue('altcha', '', { shouldValidate: true });
      }
    };

    el.addEventListener('change', onChange);
    return () => {
      el.removeEventListener('change', onChange);
    };
  }, [scriptLoaded, form]);

  // --- Réinitialiser le widget ---
  const resetAltcha = () => {
    console.log('🔄 Réinitialisation du widget ALTCHA');
    form.setValue('altcha', '', { shouldValidate: true });
    if (altchaElement && 'reset' in altchaElement) {
      (altchaElement as any).reset();
    }
  };

  // --- Soumission du formulaire ---
  const onSubmit = useCallback(
    async (data: ContactFormValues) => {
      console.log('🟢 Formulaire soumis avec données :', data);

      if (!data.altcha) {
        console.warn('⚠️ Soumission bloquée : ALTCHA non complété');
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Veuillez compléter la vérification ALTCHA.',
        });
        return;
      }

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        console.log('📨 Requête envoyée à /api/contact');
        const result = await res.json();
        console.log('📬 Réponse serveur :', result);

        if (res.ok) {
          toast({ title: 'Message envoyé avec succès 🎉' });
          form.reset();
          resetAltcha();
        } else {
          toast({
            variant: 'destructive',
            title: 'Erreur',
            description: result.message || 'Échec de l’envoi.',
          });
          resetAltcha();
        }
      } catch (err) {
        console.error('❌ Erreur réseau :', err);
        toast({
          variant: 'destructive',
          title: 'Erreur réseau',
          description: 'Impossible de contacter le serveur.',
        });
        resetAltcha();
      }
    },
    [form, toast, altchaElement]
  );

  if (!scriptLoaded)
    return (
      <div className="p-6 text-blue-500">
        Chargement du module de vérification...
      </div>
    );

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
            <form
              onSubmit={(e) => {
                console.log('🧭 Tentative de soumission du formulaire...');
                form.handleSubmit(onSubmit)(e);
              }}
              className="space-y-6"
              noValidate
            >
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

              {/* Champ caché pour la valeur ALTCHA */}
              <input type="hidden" {...form.register('altcha')} />

              <div className="flex flex-col items-center pt-2">
                <altcha-widget
                  name="altcha"
                  theme="auto"
                  auto="onsubmit"
                  challengeurl="/api/altcha"
                  style={{ width: '100%', maxWidth: 320 }}
                />
                {altchaError && (
                  <p className="text-sm text-destructive mt-2">{altchaError}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
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
