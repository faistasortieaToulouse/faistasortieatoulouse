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

    // Nettoie le container et optionnellement le cookie googtrans
    const cleanContainer = () => {
      const c = document.getElementById(CONTAINER_ID);
      if (c) c.innerHTML = '';
    };

    // Supprime l'ancien script + optionnellement l'objet google pour forcer rechargement propre
    const removeOldScriptAndGlobals = () => {
      const oldScript = document.getElementById(SCRIPT_ID);
      if (oldScript) oldScript.remove();

      try {
        // Supprimer l'objet google empêche les conflits si le script est rechargé
        // attention : cela supprime aussi d'autres APIs Google si utilisées
        // on vérifie avant de supprimer
        if (window.google) {
          try {
            delete (window as any).google;
          } catch (e) {
            // dans certains environnements delete peut échouer — on met null en fallback
            (window as any).google = undefined;
          }
        }
        // marqueur pour ne pas ré-init plusieurs fois
        window._googleTranslateInitialized = false;
      } catch (e) {
        console.warn('Erreur lors du nettoyage Google Translate:', e);
      }
    };

    // Crée le script Google Translate
    const addScript = () => {
      // si le widget a déjà été initialisé, on ne force pas le reload complet (optionnel)
      if (window._googleTranslateInitialized) {
        // ré-init du container seulement
        if (window.google?.translate) {
          try {
            cleanContainer();
            new window.google.translate.TranslateElement(
              {
                pageLanguage: 'fr',
                includedLanguages: 'de,en,ar,zh-CN,es,it,ja,pt,ru,tr',
                layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
                autoDisplay: false,
              },
              CONTAINER_ID
            );
            return;
          } catch (e) {
            console.warn('Ré-init via google.translate a échoué, on reload le script.', e);
            removeOldScriptAndGlobals();
          }
        }
      }

      // sinon, on supprime l'ancien script et on le recrée
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

    // Callback global appelée par le script Google
    window.googleTranslateElementInit = () => {
      try {
        if (!window.google?.translate) {
          console.error('API google.translate introuvable au callback.');
          return;
        }

        // vide le container avant d'initialiser (sécurité)
        const container = document.getElementById(CONTAINER_ID);
        if (container) container.innerHTML = '';

        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'fr',
            includedLanguages: 'de,en,ar,zh-CN,es,it,ja,pt,ru,tr',
            layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
            autoDisplay: false,
          },
          CONTAINER_ID
        );

        // marqueur pour dire que l'init s'est bien passée
        window._googleTranslateInitialized = true;
        console.info('Google Translate initialisé avec includedLanguages.');
      } catch (err) {
        console.error('Erreur durant googleTranslateElementInit:', err);
      }
    };

    // Lancer l'ajout du script
    addScript();

    // Si tu veux recharger proprement à chaque changement de route, garde l'écoute.
    // Sinon, tu peux enlever cette partie pour ne charger qu'une seule fois.
    const onRouteChange = () => {
      // tu peux choisir d'appeler addScript() ou de simplement ré-init le container :
      // addScript();
      // ici on essaye une ré-init propre sans forcer le reload du script
      try {
        if (window.google?.translate && !window._googleTranslateInitialized) {
          window.googleTranslateElementInit && window.googleTranslateElementInit();
        } else if (!window.google?.translate) {
          addScript();
        }
      } catch (e) {
        console.warn('Route change: erreur de ré-initialisation', e);
        addScript();
      }
    };

    router.events.on('routeChangeComplete', onRouteChange);

    return () => {
      router.events.off('routeChangeComplete', onRouteChange);
      // cleanup éventuel au unmount
      // removeOldScriptAndGlobals(); // <-- désactiver si tu veux garder le script entre pages
    };
  }, [router.events]);

  return <div id="google_translate_element" className="mt-2" />;
}
