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
  { code: 'ar', label: 'Arabe' },
];

function setCookie(name: string, value: string, days?: number) {
  let cookie = `${name}=${value};path=/;`;
  // sur localhost ne pas définir domain (évite erreurs)
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host !== 'localhost' && host.indexOf('.') !== -1) {
      // essayer .domain.tld pour couvrir sous-domaines
      const parts = host.split('.');
      const domain = '.' + parts.slice(-2).join('.');
      cookie += `domain=${domain};`;
    }
  }
  if (days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    cookie += `expires=${d.toUTCString()};`;
  }
  document.cookie = cookie;
}

function getCookie(name: string) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function GoogleTranslateCustom() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1) Définit callback global AVANT le chargement du script
    if (!(window as any).googleTranslateElementInit) {
      (window as any).googleTranslateElementInit = function () {
        try {
          new (window as any).google.translate.TranslateElement(
            {
              pageLanguage: 'fr',
              includedLanguages: LANGS.map(l => l.code).join(','), 
              layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
            },
            'google_translate_element_hidden' // conteneur caché
          );
        } catch (e) {
          // ignore — le script peut échouer dans certains environnements
          // console.error('init google translate failed', e);
        }
      };
    }

    // 2) Charger le script une seule fois si nécessaire
    const SCRIPT_ID = 'google-translate-script';
    if (!document.getElementById(SCRIPT_ID)) {
      const s = document.createElement('script');
      s.id = SCRIPT_ID;
      s.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      s.async = true;
      document.body.appendChild(s);
    }

    // 3) Si un cookie googtrans existait (par ex. utilisateur déjà choisi), garder la sélection UI en sync
    const cur = getCookie('googtrans');
    // (on ne force rien ici; c'est juste indicatif)
  }, []);

  // Lorsque l'utilisateur choisit une langue :
  const changeLang = (lang: string) => {
    // valeur du cookie attendue par Google : "/<lang_src>/<lang_target>"
    // ici page source = 'fr'
    const val = `/fr/${lang}`;
    // Mettre le cookie (certains navigateurs/anciennes impls doubleset)
    setCookie('googtrans', val, 7); 
    setCookie('googtrans', val); 
    // reload pour que le script Google lise le cookie et traduise
    window.location.reload();
  };

  return (
    <div className="google-translate-custom">
      {/* UI custom */}
      <label htmlFor="my-gg-select" className="sr-only">Langue</label>
      <select
        id="my-gg-select"
        onChange={(e) => changeLang(e.target.value)}
        defaultValue={getCookie('googtrans')?.split('/')[2] || ''} // Affiche la langue sélectionnée
        aria-label="Sélectionner une langue"
        className="px-2 py-1 rounded border"
      >
        <option value="" disabled>
          Traduire en...
        </option>
        {LANGS.map(l => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>

      {/* Conteneur Google (caché) — NECESSAIRE. La barre native ne doit pas s'afficher. */}
      <div
        id="google_translate_element_hidden"
        style={{ display: 'none', visibility: 'hidden', height: 0, width: 0, overflow: 'hidden' }}
      />
    </div>
  );
}
