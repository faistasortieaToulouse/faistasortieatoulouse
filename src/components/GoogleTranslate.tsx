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
  const [selectedLang, setSelectedLang] = useState('');

useEffect(() => {
  const currentCookie = getCookie('googtrans');
  if (!currentCookie || currentCookie === '/fr') {
    setCookie('googtrans', '/fr/fr', 7);
    setCookie('googtrans', '/fr/fr');
  }
  const langCode = getCookie('googtrans')?.split('/')[2] || 'fr';
  setSelectedLang(langCode);
}, []);

const changeLang = (lang: string) => {
  if (lang === selectedLang) return;
  setSelectedLang(lang);
  const val = `/fr/${lang}`;
  setCookie('googtrans', val, 7);
  setCookie('googtrans', val);
  window.location.reload();
};

  return (
    <>
      {/* Inject Google Translate script */}
      <div id="google_translate_element" style={{ display: 'none' }} />
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

      {/* Langue selector */}
      <div className="google-translate-custom flex items-center space-x-2">
        <label htmlFor="my-gg-select" className="sr-only">Langue</label>
        <select
          id="my-gg-select"
          onChange={(e) => changeLang(e.target.value)}
          value={selectedLang}
          aria-label="Sélectionner une langue"
          className="px-2 py-1 rounded border shadow-sm bg-card hover:bg-muted/70 transition-colors"
        >
          <option value="" disabled>Choisis ta langue</option>
          {LANGS.map(l => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
      </div>
    </>
  );
}
