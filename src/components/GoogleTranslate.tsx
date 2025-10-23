'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

// 🔧 Déclaration globale pour TypeScript
declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

export default function GoogleTranslate() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return; // sécurité SSR

    const addScript = () => {
      // Supprime l'ancien script s'il existe
      const oldScript = document.getElementById('google-translate-script');
      if (oldScript) oldScript.remove();

      // Ajoute le script Google Translate
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    };

    // Fonction de callback globale appelée par Google Translate
    window.googleTranslateElementInit = () => {
      if (!window.google?.translate) return;

      new window.google.translate.TranslateElement(
        { pageLanguage: 'fr' },
        'google_translate_element'
      );
    };

    addScript();

    // Recharge le widget à chaque changement de route
    router.events.on('routeChangeComplete', addScript);
    return () => {
      router.events.off('routeChangeComplete', addScript);
    };
  }, [router.events]);

  return (
    <div id="google_translate_element" className="mt-2" />
  );
}
