'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

const LANGS = [
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

// Langues supplémentaires uniquement (exclues de LANGS)
const EXTRA_LANGS = [
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

export default function GoogleTranslateCustom() {
  const [selectedLang, setSelectedLang] = useState('fr');
  const [scriptReady, setScriptReady] = useState(false);
  const [showExtra, setShowExtra] = useState(false);

// NOUVEAU CODE SANS LE HACK D'INTERVALLE
useEffect(() => {
  const cookie = getCookie('googtrans');
  const currentLang = cookie?.split('/')[2];

  if (!cookie || !currentLang) {
    setCookie('googtrans', '/fr/fr', 7);
  }

  setSelectedLang(currentLang || 'fr');
  setScriptReady(true);
  
  // Aucune fonction de nettoyage (return) n'est nécessaire ici.
}, []);

return;
*/

    return () => clearInterval(interval);
  }, []);

  const changeLang = (lang: string) => {
    if (lang === selectedLang) return;
    const val = `/fr/${lang}`;
    setCookie('googtrans', val, 7);
    window.location.reload();
  };

  return (
    <>
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

      <div id="google_translate_element" style={{ display: 'none' }} />

      {scriptReady && (
        <>
          <Script
            src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
            strategy="afterInteractive"
          />
// LIGNE 160 DANS src/components/GoogleTranslate.tsx
<Script id="google-translate-init" strategy="afterInteractive">
    {`
        function googleTranslateElementInit() {
            new google.translate.TranslateElement({
                pageLanguage: 'fr',
                autoDisplay: false,
                // 🚨 AJOUTEZ CETTE LIGNE 🚨
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE 
            }, 'google_translate_element');
        }
    `}
</Script>
        </>
      )}

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
