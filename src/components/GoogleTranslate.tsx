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

const EXTENDED_LANGS = [
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Allemand' },
  { code: 'en', label: 'Anglais' },
  { code: 'ar', label: 'Arabe' },
  { code: 'eu', label: 'Basque' },
  { code: 'zh-CN', label: 'Chinois' },
  { code: 'ko', label: 'Coréen' },
  { code: 'es', label: 'Espagnol' },
  { code: 'fa', label: 'Farci' },
  { code: 'el', label: 'Grec' },
  { code: 'hi', label: 'Hindi' },
  { code: 'id', label: 'Indonésien' },
  { code: 'it', label: 'Italien' },
  { code: 'ja', label: 'Japonais' },
  { code: 'nl', label: 'Néerlandais' },
  { code: 'oc', label: 'Occitan' },
  { code: 'pl', label: 'Polonais' },
  { code: 'pt', label: 'Portugais' },
  { code: 'ro', label: 'Roumain' },
  { code: 'ru', label: 'Russe' },
  { code: 'sv', label: 'Suédois' },
  { code: 'th', label: 'Thaïlandais' },
  { code: 'tr', label: 'Turc' },
  { code: 'vi', label: 'Vietnamien' },
];

function setCookie(name: string, value: string, days?: number) {
  if (typeof document === 'undefined') return;
  let cookie = `${name}=${value};path=/;`;
  if (days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    cookie += `expires=${expires.toUTCString()};`;
  }
  document.cookie = cookie;
}

function getCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function GoogleTranslateCustom() {
  const [selectedLang, setSelectedLang] = useState('fr');
  const [scriptReady, setScriptReady] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const cookie = getCookie('googtrans');
    const currentLang = cookie?.split('/')[2];

    if (!cookie || !currentLang) {
      setCookie('googtrans', '/fr/fr', 7);
    }

    setSelectedLang(currentLang || 'fr');
    setScriptReady(true);

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
          <Script id="google-translate-init" strategy="afterInteractive">
            {`
              function googleTranslateElementInit() {
                new google.translate.TranslateElement({
                  pageLanguage: 'fr',
                  autoDisplay: false
                }, 'google_translate_element');
              }
            `}
          </Script>
        </>
      )}

      <div className="google-translate-custom fixed bottom-0 left-0 w-full bg-muted text-sm p-2 flex flex-wrap items-center justify-between z-[9999]">
        <div className="flex items-center space-x-2">
          <label htmlFor="my-gg-select" className="sr-only">Langue</label>
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
              className="px-2 py-1 text-sm rounded bg-card hover:bg-muted/70 transition-colors"
            >
              Revenir au français
            </button>
          )}
        </div>

        <button
          onClick={() => setShowAll(!showAll)}
          className="text-primary underline text-sm"
        >
          {showAll ? 'Masquer les langues' : 'Afficher toutes les langues'}
        </button>
      </div>

      {showAll && (
        <div className="fixed bottom-12 left-0 w-full max-h-64 overflow-y-auto bg-background border-t shadow-lg p-4 z-[9998]">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {EXTENDED_LANGS.map(lang => (
              <button
                key={lang.code}
                onClick={() => changeLang(lang.code)}
                className="text-left px-2 py-1 rounded hover:bg-muted/50 transition-colors"
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
