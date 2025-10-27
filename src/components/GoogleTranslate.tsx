'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Déclaration globale TypeScript
declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
    _googleTranslateInitialized?: boolean;
  }
}

export default function GoogleTranslate() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const CONTAINER_ID = 'google_translate_element';
    const SCRIPT_ID = 'google-translate-script';

    // ✅ Langues que tu veux afficher (avec arabe remis)
    const includedLangs = 'en,es,it,de,pt,ru,zh-CN,ja,ar,tr';

    const cleanContainer = () => {
      const c = document.getElementById(CONTAINER_ID);
      if (c) c.innerHTML = '';
    };

    const removeOldScriptAndGlobals = () => {
      const oldScript = document.getElementById(SCRIPT_ID);
      if (oldScript) oldScript.remove();

      try {
        if (window.google) delete (window as any).google;
      } catch {
        (window as any).google = undefined;
      }
      window._googleTranslateInitialized = false;
    };

    const addScript = () => {
      removeOldScriptAndGlobals();
      cleanContainer();

      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.defer = true;
      script.onerror = () => console.error('Échec du chargement du script Google Translate.');
      document.body.appendChild(script);
    };

    window.googleTranslateElementInit = () => {
      try {
        if (!window.google?.translate) {
          console.error('API google.translate introuvable au callback.');
          return;
        }

        cleanContainer();
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'fr',
            includedLanguages: includedLangs,
            layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
            autoDisplay: false,
          },
          CONTAINER_ID
        );

        window._googleTranslateInitialized = true;
        console.info('Google Translate initialisé avec langues limitées.');
      } catch (err) {
        console.error('Erreur durant googleTranslateElementInit:', err);
      }
    };

    addScript();

    const onRouteChange = () => {
      try {
        if (window.google?.translate && window._googleTranslateInitialized) {
          cleanContainer();
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'fr',
              includedLanguages: includedLangs,
              layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
              autoDisplay: false,
            },
            CONTAINER_ID
          );
        } else {
          addScript();
        }
      } catch (e) {
        console.warn('Erreur de réinit lors du changement de route', e);
        addScript();
      }
    };

    router.events.on('routeChangeComplete', onRouteChange);

    return () => {
      router.events.off('routeChangeComplete', onRouteChange);
    };
  }, [router.events]);

  return <div id="google_translate_element" className="mt-2" />;
}
