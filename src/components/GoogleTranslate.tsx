// src/components/GoogleTranslate.tsx
'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation'; // Import pour le routage côté client

// ⭐️ DÉCLARATION DE TYPE GLOBAL POUR GOOGLE TRANSLATE ⭐️
// Corrige l'erreur: Property 'translate' does not exist on type 'typeof google'
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
// Corrige l'erreur: Variable 'LANGS' implicitly has type 'any[]'
interface Language {
  code: string;
  label: string;
}

// --- Constantes typées ---
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

// --- Fonctions utilitaires (inchangées) ---
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

// Remplacer l'ancienne fonction triggerGoogleTranslate (lignes ~80-92)
// et ajouter la fonction initializeGoogleTranslate avant l'export par défaut.

// 💡 Fonction pour initialiser/réinitialiser le widget Google 
const initializeGoogleTranslate = (targetLang: string) => {
    if (typeof window.google?.translate?.TranslateElement === 'undefined') {
        return; // Le script n'est pas encore chargé
    }
    
    // Étape 1: Vider l'élément pour forcer la réinitialisation par l'API de Google
    const existingElement = document.getElementById('google_translate_element');
    if (existingElement) {
        existingElement.innerHTML = '';
    }

    // Étape 2: Créer le nouvel objet Google Translate
    new window.google.translate.TranslateElement({
        pageLanguage: 'fr',
        // Utiliser includedLanguages est une astuce pour forcer la traduction immédiate
        includedLanguages: `fr,${targetLang}`, 
        autoDisplay: false
    }, 'google_translate_element');
    
    // Étape 3: Déclencher manuellement l'événement 'change'
    setTimeout(() => {
        const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (combo && combo.value !== targetLang) {
            combo.value = targetLang;
            combo.dispatchEvent(new Event('change'));
        }
    }, 100);
};


// 💡 Nouvelle Fonction principale de déclenchement (utilise la réinitialisation)
const triggerGoogleTranslate = (targetLang: string) => {
    // Si la langue est français, on doit recharger la page pour supprimer les marques de traduction
    if (targetLang === 'fr') {
        setCookie('googtrans', '/fr/fr', 7);
        window.location.reload(); 
        return;
    }
    
    // Sinon, on recrée le widget
    initializeGoogleTranslate(targetLang);
};

export default function GoogleTranslateCustom() {
  // L'import de usePathname est maintenu mais n'est plus utilisé dans un useEffect ici.
  // const pathname = usePathname(); 
  const [selectedLang, setSelectedLang] = useState('fr');
  const [scriptReady, setScriptReady] = useState(false);
  const [showExtra, setShowExtra] = useState(false);

  // 1. useEffect d'initialisation (Ce code s'exécute à chaque montage du composant)
  useEffect(() => {
    const cookie = getCookie('googtrans');
    const currentLang = cookie?.split('/')[2];
    const initialLang = currentLang || 'fr'; // Nouveau: on garde la langue initiale

    if (!cookie || !currentLang) {
      setCookie('googtrans', '/fr/fr', 7);
    }

    setSelectedLang(initialLang);
    setScriptReady(true);

// ⭐️ LOGIQUE DE FORÇAGE DE LA TRADUCTION INITIALE ⭐️
    // On lance la fonction pour appliquer la traduction après un court délai
    const forceInitialTranslation = () => {
        if (initialLang !== 'fr') {
            // Utiliser un délai pour laisser le temps au script de Google de s'initialiser
            setTimeout(() => {
                triggerGoogleTranslate(initialLang);
            }, 500); // Délai augmenté à 500ms
        }
    };

    // 1. Si le script Google est déjà chargé (cas de navigation interne ou d'un montage tardif)
    if (typeof window.google?.translate?.TranslateElement !== 'undefined') {
        forceInitialTranslation();
    } else {
        // 2. Si le script n'est pas encore chargé (cas de F5), on écoute l'événement de script
        // ATTENTION : Cette logique dépend du fait que le script utilise la fonction globale cb=googleTranslateElementInit
        // Le code de googleTranslateElementInit va appeler notre logique une fois le script chargé.
        window.googleTranslateElementInit = () => {
            // L'API est chargée, on peut forcer la traduction
            forceInitialTranslation();
        };
    }
    
    // ... (Logique de l'intervalle de masquage de la bannière inchangée)
    const interval = setInterval(() => {
      const bannerFrame = document.querySelector('iframe.goog-te-banner-frame') as HTMLIFrameElement | null;
      // ... (styles de masquage) ...
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

    // La fonction de cleanup est cruciale car le composant va être détruit par la key!
    return () => clearInterval(interval);
  }, []); // [] : S'exécute au montage/démontage

  // ⭐️ 2. useEffect de surveillance des changements de route ⭐️
  // CE USEEFFECT EST MAINTENANT OBSOLÈTE ET DOIT ÊTRE SUPPRIMÉ OU COMMENTÉ
  /*
  useEffect(() => {
      if (scriptReady) {
          // Un délai est nécessaire pour que le DOM de la nouvelle page soit prêt
          setTimeout(triggerGoogleTranslate, 50); 
      }
  }, [pathname, scriptReady]);
  */

// 3. Fonction changeLang (CORRIGÉE : Utilise uniquement le nouveau trigger)
const changeLang = (lang: string) => {
    if (lang === selectedLang) return;
    
    // setCookie est maintenant géré à l'intérieur de triggerGoogleTranslate pour le 'fr'
    if (lang !== 'fr') {
        const val = `/fr/${lang}`;
        setCookie('googtrans', val, 7);
    }

    setSelectedLang(lang);
    // Le nouveau trigger gère soit le reload (pour 'fr') soit la recréation du widget
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
          {/* 🛑 SCRIPT D'INITIALISATION CORRIGÉ 🛑 */}
          <Script id="google-translate-init" strategy="afterInteractive">
            {`
              function googleTranslateElementInit() {
                  const checkExist = setInterval(function() {
                      const element = document.getElementById('google_translate_element');
                      
                      if (element) {
                          clearInterval(checkExist);
                          
                          // Initialisation classique de Google Translate
                          new google.translate.TranslateElement({
                              pageLanguage: 'fr',
                              autoDisplay: false
                          }, 'google_translate_element');
                          
                          // 🚨 Exécutez immédiatement la logique de persistance si besoin
                          // window.dispatchEvent(new Event('domreadyforinitialtranslate')); 
                          // NOTE : Ce trigger peut être géré dans votre useEffect du composant React
                      }
                  }, 100); // Vérifie toutes les 100ms
              }
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
