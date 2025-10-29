// src/components/GoogleTranslate.tsx
'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';

// ⭐️ DÉCLARATION DE TYPE GLOBAL POUR GOOGLE TRANSLATE ⭐️
declare global {
  interface Window {
    google: {
      translate: {
        TranslateElement: new (config: any, elementId: string) => void;
      };
    };
    googleTranslateElementInit: () => void;
  }
}
// ----------------------------------------------------

// ⭐️ INTERFACE POUR LE TYPAGE DES LANGUES ⭐️
interface Language {
  code: string;
  label: string;
}

// --- Constantes typées (Inchngées) ---
const LANGS: Language[] = [
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Allemand' },
  { code: 'en', label: 'Anglais' },
  { code: 'ar', label: 'Arabe' },
  { code: 'zh-CN', label: 'Chinois (simpl.)' },
  { code: 'es', label: 'Espagnol' },
  { code: 'it', label: 'Italien' },
  { code: 'ja', label: 'Japonais' },
  { code: 'pt', label: 'Portugais' },
  { code: 'ru', label: 'Russe' },
  { code: 'tr', label: 'Turc' },
];

const EXTRA_LANGS: Language[] = [
  { code: 'eu', label: 'Basque' },
  { code: 'ko', label: 'Coréen' },
  { code: 'fa', label: 'Farci' },
  { code: 'el', label: 'Grec' },
  { code: 'hi', label: 'Hindi' },
  { code: 'id', label: 'Indonésien' },
  { code: 'nl', label: 'Néerlandais' },
  { code: 'oc', label: 'Occitan' },
  { code: 'pl', label: 'Polonais' },
  { code: 'ro', label: 'Roumain' },
  { code: 'sv', label: 'Suédois' },
  { code: 'th', label: 'Thaïlandais' },
  { code: 'vi', label: 'Vietnamien' },
];

// --- Fonctions utilitaires (Inchngées) ---
function setCookie(name: string, value: string, days?: number) {
  if (typeof document === 'undefined') return;
  let cookie = `${name}=${value};path=/;`;
  if (days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    cookie += `expires=${d.toUTCString()};`;
  }
  document.cookie = cookie;
}

function getCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// 💡 FONCTION CLÉ : Initialise/Réinitialise le widget Google Translate
const initializeGoogleTranslate = (targetLang: string) => {
    if (typeof window.google?.translate?.TranslateElement === 'undefined') {
        return; // Script non chargé
    }
    
    // Étape 1: Vider l'élément pour forcer la réinitialisation par l'API de Google
    const existingElement = document.getElementById('google_translate_element');
    if (existingElement) {
        existingElement.innerHTML = '';
    }

    // Étape 2: Créer le nouvel objet pour forcer l'application de la traduction
    new window.google.translate.TranslateElement({
        pageLanguage: 'fr',
        // Utiliser includedLanguages est une astuce pour s'assurer que la langue est présente
        includedLanguages: `fr,${targetLang}`, 
        autoDisplay: false
    }, 'google_translate_element');
    
    // Étape 3: Déclenchement manuel par l'événement change (via un petit délai)
    setTimeout(() => {
        const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (combo && combo.value !== targetLang) {
            combo.value = targetLang;
            combo.dispatchEvent(new Event('change'));
        }
    }, 100);
};


// 💡 Fonction pour déclencher la traduction après navigation ou changement manuel
const triggerGoogleTranslate = (targetLang: string) => {
    if (targetLang === 'fr') {
        // Si retour au français, la seule méthode fiable est souvent de recharger
        setCookie('googtrans', '/fr/fr', 7);
        window.location.reload();
        return;
    }
    
    // Sinon, on recrée le widget pour forcer la traduction sur le nouveau DOM
    initializeGoogleTranslate(targetLang);
};


export default function GoogleTranslateCustom() {
  const pathname = usePathname();
  const [selectedLang, setSelectedLang] = useState('fr');
  const [scriptReady, setScriptReady] = useState(false);
  const [showExtra, setShowExtra] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true); // Pour ignorer le premier useEffect du pathname

  // 1. useEffect d'initialisation (gère les cookies et masquage de la bannière)
  useEffect(() => {
    const cookie = getCookie('googtrans');
    const currentLang = cookie?.split('/')[2];
    const initialLang = currentLang || 'fr';

    if (!cookie || !currentLang) {
      setCookie('googtrans', '/fr/fr', 7);
    }

    setSelectedLang(initialLang);
    setScriptReady(true);

    // Initialisation de la traduction au premier chargement (s'il y a un cookie)
    if (initialLang !== 'fr') {
        initializeGoogleTranslate(initialLang);
    }
    
    setInitialLoad(false);

    // Masquage de la bannière Google (Logique inchangée)
    const interval = setInterval(() => {
        const bannerFrame = document.querySelector('iframe.goog-te-banner-frame') as HTMLIFrameElement | null;
        if (bannerFrame) {
            bannerFrame.style.height = '20px';
            bannerFrame.style.minHeight = '20px';
            bannerFrame.style.maxHeight = '20px';
            bannerFrame.style.overflow = 'hidden';
            bannerFrame.style.position = 'fixed';
            bannerFrame.style.bottom = '0';
            bannerFrame.style.top = 'auto';
            bannerFrame.style.zIndex = '9999';
        }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // ⭐️ 2. useEffect de surveillance des changements de route ⭐️
  useEffect(() => {
      if (scriptReady && !initialLoad) { // On ignore le chargement initial
          const cookie = getCookie('googtrans');
          const currentLang = cookie?.split('/')[2];
        
        // Si une langue est sélectionnée, on force la réapplication
          if (currentLang && currentLang !== 'fr') {
              setTimeout(() => triggerGoogleTranslate(currentLang), 100); 
          }
      }
  }, [pathname, scriptReady, initialLoad]);

  // 3. Fonction changeLang mise à jour : Utilise triggerGoogleTranslate
  const changeLang = (lang: string) => {
    if (lang === selectedLang) return;
    
    setSelectedLang(lang);

    // triggerGoogleTranslate gère la mise à jour du cookie et l'action (reload ou recréation)
    triggerGoogleTranslate(lang);
  };


  return (
    <>
      {/* --- Styles globaux (inchangés) --- */}
      <style jsx global>{`
        .goog-te-banner-frame.skiptranslate,
        body > .skiptranslate,
        iframe.goog-te-banner-frame,
        iframe#\:1\.container {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
        }
        body {
          top: 0px !important;
          position: relative !important;
          margin-bottom: 20px !important;
        }
        .goog-te-overlay,
        .goog-logo-link,
        .goog-te-gadget-icon,
        .goog-te-menu-value,
        .goog-te-combo {
          display: none !important;
          visibility: hidden !important;
        }
        .goog-te-gadget {
          font-size: 0 !important;
        }
      `}</style>

      {/* Div où Google insère le widget masqué */}
      <div id="google_translate_element" style={{ display: 'none' }} />

      {scriptReady && (
        <>
          {/* Script de l'API Google Translate */}
          <Script
            src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
            strategy="afterInteractive"
          />
          {/* Script d'initialisation (wrapper pour initializeGoogleTranslate) */}
          <Script id="google-translate-init" strategy="afterInteractive">
            {`
              // Rendre la fonction d'initialisation disponible globalement pour le script Google
              window.initializeGoogleTranslate = function(targetLang) {
                   const existingElement = document.getElementById('google_translate_element');
                   if (existingElement) {
                       existingElement.innerHTML = '';
                   }
                   new google.translate.TranslateElement({
                       pageLanguage: 'fr',
                       includedLanguages: 'fr,' + targetLang,
                       autoDisplay: false
                   }, 'google_translate_element');
                   
                   setTimeout(() => {
                       const combo = document.querySelector('.goog-te-combo');
                       if (combo && combo.value !== targetLang) {
                           combo.value = targetLang;
                           combo.dispatchEvent(new Event('change'));
                       }
                   }, 100);
              };

              window.googleTranslateElementInit = function() {
                  const cookie = document.cookie.match(new RegExp('(^| )googtrans=([^;]+)'));
                  const currentLang = cookie ? decodeURIComponent(cookie[2]).split('/')[2] : 'fr';
                  
                   // On initialise avec la langue source pour que le widget soit prêt.
                   // La logique React gère la traduction.
                   if (currentLang === 'fr') {
                       new google.translate.TranslateElement({
                           pageLanguage: 'fr',
                           autoDisplay: false
                       }, 'google_translate_element');
                   }
              };
            `}
          </Script>
        </>
      )}

      {/* --- Votre UI personnalisée --- */}
      <div className="google-translate-custom flex flex-wrap items-center gap-2 mt-4">
        <select
          id="my-gg-select"
          onChange={(e) => changeLang(e.target.value)}
          value={selectedLang}
          aria-label="Sélectionner une langue"
          className="px-2 py-1 rounded border shadow-sm bg-card hover:bg-muted/70 transition-colors"
        >
          <option value="" disabled>Choisis ta langue</option>
          {LANGS.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>

        {selectedLang !== 'fr' && (
          <button
            onClick={() => changeLang('fr')}
            className="px-2 py-1 text-sm rounded bg-muted hover:bg-muted/80 transition-colors"
          >
            Revenir au français
          </button>
        )}

        <button
          onClick={() => setShowExtra(!showExtra)}
          className="text-sm underline text-primary"
        >
          {showExtra ? 'Masquer les autres langues' : 'Afficher d’autres langues'}
        </button>
      </div>

      {showExtra && (
        <select
          onChange={(e) => changeLang(e.target.value)}
          value={selectedLang}
          aria-label="Sélectionner une langue supplémentaire"
          className="mt-2 px-2 py-1 rounded border shadow-sm bg-card hover:bg-muted/70 transition-colors"
        >
          <option value="" disabled>Choisis une langue supplémentaire</option>
          {EXTRA_LANGS.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      )}

      <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
        <img
          src="https://www.gstatic.com/images/branding/product/1x/translate_24dp.png"
          alt="Google Translate"
          width={16}
          height={16}
        />
        <span>Traduction fournie par Google Translate</span>
      </div>
    </>
  );
}
