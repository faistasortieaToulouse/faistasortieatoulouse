'use client';

import { useEffect } from 'react';

type Win = Window & {
  google?: any;
  googleTranslateElementInit?: () => void;
  _googleTranslateInitialized?: boolean;
};

const ALLOWED_LANGS = ['en','es','it','de','pt','ru','ar','tr','zh-CN','ja']; 
// ordre / contenu exact que tu veux afficher

export default function GoogleTranslate() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as Win;
    const SCRIPT_ID = 'google-translate-script';
    const CONTAINER_ID = 'google_translate_element';

    // callback global défini avant le chargement du script
    if (!w.googleTranslateElementInit) {
      w.googleTranslateElementInit = () => {
        try {
          new w.google.translate.TranslateElement(
            {
              pageLanguage: 'fr',
              includedLanguages: ALLOWED_LANGS.join(','), // on fournit quand même
              layout: w.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
            },
            CONTAINER_ID
          );
          w._googleTranslateInitialized = true;
        } catch (e) {
          console.error('Erreur init Google Translate:', e);
        }
      };
    }

    // charge le script une seule fois
    const addScript = () => {
      if (document.getElementById(SCRIPT_ID)) return;
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    };

    addScript();

    // --- Fonctions pour "nettoyer" le select des langues ---
    const cleanSelectOptions = () => {
      // le select du widget a généralement la classe 'goog-te-combo'
      const select = document.querySelector<HTMLSelectElement>('#google_translate_element select.goog-te-combo');
      if (!select) return false;
      // build set of allowed values — attention à zh-CN qui peut apparaître en 'zh-CN' ou 'zh_TW' etc.
      const allowedSet = new Set(ALLOWED_LANGS);

      // on itère à l'envers car on peut supprimer des options
      for (let i = select.options.length - 1; i >= 0; i--) {
        const opt = select.options[i];
        const value = opt.value?.trim();
        // Certains libellés/value peuvent utiliser "_" ou "-" ; on normalise pour la comparaison
        const normalized = value ? value.replace('_', '-').toLowerCase() : '';
        // Map normalization for Chinese: widget may use 'zh-CN' or 'zh-CN' consistently; keep both checks simple
        const matches = ALLOWED_LANGS.some(a => a.toLowerCase() === normalized);
        if (!matches) {
          select.remove(i);
        }
      }
      return true;
    };

    // Essaie de nettoyer immédiatement si l'élément est déjà présent
    const tryCleanOnce = () => {
      // retry quelques fois sur une courte durée car widget peut être lent
      let attempts = 0;
      const maxAttempts = 10;
      const interval = setInterval(() => {
        attempts++;
        const ok = cleanSelectOptions();
        if (ok || attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 300); // toutes les 300ms, jusqu'à maxAttempts
    };

    // Observer pour ré-appliquer le nettoyage si le widget recrée le select plus tard
    const observer = new MutationObserver(() => {
      cleanSelectOptions();
    });
    const container = document.getElementById(CONTAINER_ID);
    if (container) {
      observer.observe(container, { childList: true, subtree: true });
    } else {
      // si container pas encore présent, on surveille body pour sa création
      const bodyObserver = new MutationObserver(() => {
        const c = document.getElementById(CONTAINER_ID);
        if (c) {
          observer.observe(c, { childList: true, subtree: true });
          bodyObserver.disconnect();
        }
      });
      bodyObserver.observe(document.body, { childList: true, subtree: true });
    }

    // démarre les essais de nettoyage
    tryCleanOnce();

    // cleanup à l'unmount : on ne supprime pas le script (préserve stabilité)
    return () => {
      observer.disconnect();
    };
  }, []);

  return <div id="google_translate_element" className="mt-2" />;
}
