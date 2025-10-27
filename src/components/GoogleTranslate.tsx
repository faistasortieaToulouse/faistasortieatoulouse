'use client';

import { useEffect } from 'react';

const LANGS: { code: string; label: string }[] = [
  { code: 'en', label: 'Anglais' },
  { code: 'es', label: 'Espagnol' },
  { code: 'it', label: 'Italien' },
  { code: 'de', label: 'Allemand' },
  { code: 'pt', label: 'Portugais' },
  { code: 'ru', label: 'Russe' },
  { code: 'zh-CN', label: 'Chinois (simpl.)' },
  { code: 'ja', label: 'Japonais' },
  { code: 'tr', label: 'Turc' },
  { code: 'ar', label: 'Arabe' }, // optionnel
];

function setCookie(name: string, value: string, days = 7) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = 'expires=' + d.toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;${expires};SameSite=Lax`;
}

export default function GoogleTranslate() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as any;
    const SCRIPT_SRC = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    const SCRIPT_ID = 'google-translate-script';

    // Eviter doublons de script
    const existing = Array.from(document.querySelectorAll(`script[src*="translate.google.com/translate_a/element.js"]`));
    if (existing.length > 1) {
      existing.slice(1).forEach((s) => s.remove());
    }

    if (!w.googleTranslateElementInit) {
      w.googleTranslateElementInit = function () {
        try {
          new w.google.translate.TranslateElement(
            {
              pageLanguage: 'fr',
              includedLanguages: LANGS.map((l) => l.code).join(','),
              layout: w.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
            },
            'google_translate_element_hidden'
          );
          w._googleTranslateInitialized = true;
        } catch (e) {
          console.warn('Erreur googleTranslateElementInit', e);
        }
      };
    }

    if (!document.getElementById(SCRIPT_ID) && existing.length === 0) {
      const s = document.createElement('script');
      s.id = SCRIPT_ID;
      s.src = SCRIPT_SRC;
      s.async = true;
      document.body.appendChild(s);
    } else if (!document.getElementById(SCRIPT_ID) && existing.length === 1) {
      existing[0].id = SCRIPT_ID;
    }

    // CSS pour masquer l'UI native et éviter overlay
    const styleId = 'google-translate-hide-style';
    if (!document.getElementById(styleId)) {
      const st = document.createElement('style');
      st.id = styleId;
      st.innerHTML = `
        .goog-te-banner-frame.skiptranslate { display: none !important; }
        .goog-te-gadget { display: none !important; }
        select.goog-te-combo { display: none !important; }
        iframe.goog-te-menu-frame { visibility: hidden !important; height: 0 !important; overflow: hidden !important; }
        html, body { margin-top: 0 !important; }
        #__next, main, #root { position: relative; z-index: 1; }
        #google_translate_element_hidden { position: absolute !important; left: -9999px !important; top: -9999px !important; width: 1px !important; height: 1px !important; overflow: hidden !important; }
      `;
      document.head.appendChild(st);
    }

    // leave script in place (no cleanup)
  }, []);

  const changeLang = (lang: string) => {
    const val = `/fr/${lang}`;
    setCookie('googtrans', val, 7);
    document.cookie = `googtrans=${encodeURIComponent(val)};path=/;`;
    window.location.reload();
  };

  return (
    <div style={{ position: 'relative', zIndex: 9999 }}>
      <label htmlFor="my-gg-select" className="sr-only">Langue</label>
      <select
        id="my-gg-select"
        onChange={(e) => changeLang(e.target.value)}
        defaultValue=""
        aria-label="Sélectionner une langue"
        className="px-2 py-1 rounded border bg-white"
      >
        <option value="" disabled>
          Traduire en...
        </option>
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>

      <div
        id="google_translate_element_hidden"
        style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}
        aria-hidden
      />
    </div>
  );
}
