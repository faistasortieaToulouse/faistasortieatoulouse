'use client';

import { useRef, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// --- Déclaration globale pour Turnstile ---
declare global {
  interface Window {
    turnstile: {
      render: (el: HTMLElement, options: any) => string;
      reset: (widgetIdOrContainer: string | HTMLElement) => void;
    };
  }
}

// --- Validation simple ---
const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
  'cf-turnstile-response': z.string().min(1, { message: 'Veuillez compléter la vérification anti-bot.' }),
});

type FormValues = z.infer<typeof schema>;

export default function ContactPage() {
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [siteKey, setSiteKey] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
      'cf-turnstile-response': '',
    },
  });

  // --- Récupérer la clé publique côté client ---
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;
    if (!key) {
      console.error("❌ NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY est manquant !");
      return;
    }
    setSiteKey(key);
  }, []);

  // --- Initialiser Turnstile ---
  useEffect(() => {
    if (siteKey && turnstileRef.current && window.turnstile && !widgetIdRef.current) {
      widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: siteKey,
        theme: "auto",
        callback: (token: string) => form.setValue('cf-turnstile-response', token),
        "error-callback": () => form.setValue('cf-turnstile-response', ''),
        "expired-callback": () => form.setValue('cf-turnstile-response', ''),
      });
    }
  }, [siteKey, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        alert("Message envoyé !");
        form.reset();
        if (window.turnstile && turnstileRef.current) window.turnstile.reset(turnstileRef.current);
      } else {
        alert(result.message || "Erreur à l'envoi");
        if (window.turnstile && turnstileRef.current) window.turnstile.reset(turnstileRef.current);
      }
    } catch (err) {
      console.error(err);
      alert("Impossible de contacter le serveur.");
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Contactez-nous</h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <input {...form.register('name')} placeholder="Nom" className="w-full border p-2" />
        <input {...form.register('email')} placeholder="Email" className="w-full border p-2" />
        <textarea {...form.register('message')} placeholder="Message" rows={5} className="w-full border p-2" />
        <input type="hidden" {...form.register('cf-turnstile-response')} />
        <div ref={turnstileRef} className="cf-turnstile my-2" />
        {form.formState.errors['cf-turnstile-response'] && (
          <p className="text-red-600 text-sm">{form.formState.errors['cf-turnstile-response']?.message}</p>
        )}
        <button type="submit" className="w-full bg-blue-600 text-white p-2">Envoyer</button>
      </form>
    </div>
  );
}
