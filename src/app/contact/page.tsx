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
  if (!document.querySelector('script[data-altcha-loaded]')) {
    const script = document.createElement('script');
    script.src = '/js/altcha.js'; // ✅ URL CDN ALTCHA
    script.async = true;
    script.defer = true;
    script.type = 'module';
    script.setAttribute('data-altcha-loaded', 'true');
    script.onload = () => {
      console.log('✅ ALTCHA.js chargé');
      setTimeout(() => setScriptLoaded(true), 100);
    };
    script.onerror = (e) => {
      console.error('❌ Impossible de charger ALTCHA.js', e);
    };
    document.body.appendChild(script);
  } else {
    console.log('✅ ALTCHA.js déjà chargé');
    setScriptLoaded(true);
  }
}, []);


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

src/app/contact/layout.tsx

// Ce layout reste un composant serveur (pas de 'use client')
import MainLayout from "@/app/(main)/layout";
import { ReactNode } from "react";
import Script from "next/script";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <MainLayout>{children}</MainLayout>

      {/* --- Script Cloudflare Turnstile RETIRÉ ---
        Le script ALTCHA est désormais chargé spécifiquement dans src/app/contact/page.jsx 
        pour ne s'appliquer qu'à cette page.
      */}
    </>
  );
}
