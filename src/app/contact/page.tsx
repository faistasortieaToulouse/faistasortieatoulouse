'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'altcha-widget': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        name?: string;
        maxnumber?: string;
        theme?: 'light' | 'dark' | 'auto';
        auto?: 'onsubmit';
        'challengeurl'?: string;
      }, HTMLElement>;
    }
  }
}

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
  const altchaRef = useRef<HTMLElement>(null);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: '', email: '', subject: '', message: '', altcha: '' },
  });

  const altchaError = form.formState.errors['altcha']?.message;

  // --- Charger ALTCHA.js ---
  useEffect(() => {
    if (!document.querySelector('script[data-altcha-loaded]')) {
      const script = document.createElement('script');
      script.src = '/js/altcha.js';
      script.async = true;
      script.defer = true;
      script.type = 'module';
      script.setAttribute('data-altcha-loaded', 'true');
      script.onload = () => setScriptLoaded(true);
      document.body.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, []);

  // --- Événements verified / unverified ---
  useEffect(() => {
    if (!scriptLoaded || !altchaRef.current) return;

    const widget = altchaRef.current;
    const onVerified = (event: any) => form.setValue('altcha', event.detail.payload, { shouldValidate: true });
    const onUnverified = () => form.setValue('altcha', '', { shouldValidate: true });

    widget.addEventListener('verified', onVerified);
    widget.addEventListener('unverified', onUnverified);

    return () => {
      widget.removeEventListener('verified', onVerified);
      widget.removeEventListener('unverified', onUnverified);
    };
  }, [scriptLoaded, form]);

  const resetAltcha = () => {
    form.setValue('altcha', '', { shouldValidate: true });
    if (altchaRef.current && (altchaRef.current as any).reset) (altchaRef.current as any).reset();
  };

  const onSubmit = useCallback(async (data: ContactFormValues) => {
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
        resetAltcha();
      } else {
        toast({ variant: 'destructive', title: 'Erreur', description: result.message || 'Échec de l’envoi.' });
        resetAltcha();
      }
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: 'Erreur réseau', description: 'Impossible de contacter le serveur.' });
      resetAltcha();
    }
  }, [form, toast]);

  if (!scriptLoaded) return <div className="p-6 text-blue-500">Chargement du module de vérification...</div>;

  return (
    <div className="p-4 md:p-8">
      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold text-primary">Nous contacter</h1>
        <p className="mt-2 text-muted-foreground">Une question, une suggestion ? N&apos;hésitez pas à nous envoyer un message.</p>
      </header>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Formulaire de contact</CardTitle>
          <CardDescription>Remplissez les champs ci-dessous.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl><Input {...field} placeholder="Jean Dupont" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input {...field} placeholder="jean@example.com" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="subject" render={({ field }) => (
                <FormItem>
                  <FormLabel>Sujet</FormLabel>
                  <FormControl><Input {...field} placeholder="Votre sujet" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="message" render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl><Textarea {...field} rows={5} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>

              {/* Champ caché ALTCHA */}
              <input type="hidden" {...form.register('altcha')} />

              {/* Widget ALTCHA */}
              <div className="flex flex-col items-center pt-2">
                <altcha-widget
                  ref={altchaRef}
                  name="altcha"
                  maxnumber="1000000"
                  theme="auto"
                  auto="onsubmit"
                  challengeurl="/api/altcha" // ✅ lien correct vers GET
                />
                {altchaError && <p className="text-sm text-destructive mt-2">{altchaError}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                <Send className="mr-2 h-4 w-4" />
                {form.formState.isSubmitting ? "Envoi..." : "Envoyer"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
