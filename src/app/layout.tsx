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
  // On évite forcer domain pour ne pas casser en environnements vercel / localhost
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;${expires};SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export default function GoogleTranslate() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as any;
    const SCRIPT_SRC = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    const SCRIPT_ID = 'google-translate-script';

    // 1) Supprime scripts dupliqués (garde au plus un)
    const existing = Array.from(document.querySelectorAll(`script[src*="translate.google.com/translate_a/element.js"]`));
    if (existing.length > 1) {
      // garde le premier, supprime les autres
      existing.slice(1).forEach((s) => {
        s.remove();
      });
    }

    // 2) Définit callback global AVANT de charger (ou si déjà défini, on ne le remplace pas)
    if (!w.googleTranslateElementInit) {
      w.googleTranslateElementInit = function () {
        try {
          // Init **dans le container caché** pour éviter l'UI native visible
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

    // 3) Ajoute le script s'il n'existe pas
    if (!document.getElementById(SCRIPT_ID) && existing.length === 0) {
      const s = document.createElement('script');
      s.id = SCRIPT_ID;
      s.src = SCRIPT_SRC;
      s.async = true;
      document.body.appendChild(s);
    } else if (!document.getElementById(SCRIPT_ID) && existing.length === 1) {
      // si un script existait (mais pas avec ID), on lui donne l'ID pour la propreté
      existing[0].id = SCRIPT_ID;
    }

    // 4) Injecte CSS pour masquer les éléments natifs de Google Translate (bannières / gadget)
    // Note : on ne peut pas accéder au contenu des iframes cross-origin, mais ces règles cachent
    // la barre et les gadgets que le script insère dans le DOM parent.
    const styleId = 'google-translate-hide-style';
    if (!document.getElementById(styleId)) {
      const st = document.createElement('style');
      st.id = styleId;
      st.innerHTML = `
        /* masquer barre banniere en haut */
        .goog-te-banner-frame.skiptranslate { display: none !important; }
        /* masquer gadget intégré */
        .goog-te-gadget { display: none !important; }
        /* masquer le petit sélecteur automatique si présent */
        select.goog-te-combo { display: none !important; }
        /* parfois Google injecte un iframe menu ; on tente de réduire son impact */
        iframe.goog-te-menu-frame { visibility: hidden !important; height: 0 !important; overflow: hidden !important; }
      `;
      document.head.appendChild(st);
    }

    // cleanup minimal : ne supprime pas le script (conserve stabilité)
    return () => {
      // on garde script pour éviter ré-init involontaire sur navigation interne
    };
  }, []);

  const changeLang = (lang: string) => {
    // set cookie expected: "/<source>/<target>"
    const val = `/fr/${lang}`;
    setCookie('googtrans', val, 7);
    // certains environnements requièrent le cookie sur le path racine et la racine du domaine
    // on fait un second set sans SameSite etc. si nécessaire (doublon sans domain)
    document.cookie = `googtrans=${encodeURIComponent(val)};path=/;`;
    // reload la page pour que Google prenne en compte le cookie et traduise
    window.location.reload();
  };

  return (
    <div className="google-translate-custom">
      <label htmlFor="my-gg-select" className="sr-only">Langue</label>
      <select
        id="my-gg-select"
        onChange={(e) => changeLang(e.target.value)}
        defaultValue=""
        aria-label="Sélectionner une langue"
        className="px-2 py-1 rounded border"
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

      {/* Conteneur caché pour que Google initialise son moteur sans afficher l'UI native */}
      <div
        id="google_translate_element_hidden"
        style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}
        aria-hidden
      />
    </div>
  );
}
