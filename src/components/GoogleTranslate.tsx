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

    const host = document.location.hostname;

    const domainsToTry = [
        host,                // www.faistasortieatoulouse.online
        '.' + host,          // .faistasortieatoulouse.online
        'faistasortieatoulouse.online', // domaine racine
    ];

    let cookie = `${name}=${value};path=/;`;
    if (days) {
        const d = new Date();
        d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
        cookie += `expires=${d.toUTCString()};`;
    }

    // Définir le cookie sur tous les domaines possibles
    domainsToTry.forEach(domain => {
        document.cookie = `${cookie}domain=${domain};`;
    });
}

function getCookie(name: string) {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}

function deleteCookie(name: string) {
    if (typeof document === 'undefined') return;

    const host = document.location.hostname;
    const domainsToTry = [
        host,
        '.' + host,
        'faistasortieatoulouse.online',
    ];

    const expiredCookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;`;

    domainsToTry.forEach(domain => {
        document.cookie = `${expiredCookie}domain=${domain};`;
    });
}

export default function GoogleTranslateCustom() {
    const [selectedLang, setSelectedLang] = useState('fr');
    const [scriptReady, setScriptReady] = useState(false);
    const [showExtra, setShowExtra] = useState(false);

    useEffect(() => {
        const cookie = getCookie('googtrans');
        const currentLang = cookie?.split('/')[2];

        // Maintien de la vérification initiale
        if (!cookie || !currentLang) {
            // S'assurer que le cookie est défini sur 'fr' par défaut au premier chargement
            setCookie('googtrans', '/fr/fr', 7);
        }

        setSelectedLang(currentLang || 'fr');
        setScriptReady(true);

        // Code pour masquer la bannière, conservé ici
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

  const applyTranslation = () => {
    if (lang === 'fr') {
      document.cookie = 'googtrans=/fr/fr; path=/;';
      (window as any).doGTranslate?.('fr|fr');
    } else {
      document.cookie = `googtrans=/fr/${lang}; path=/;`;
      (window as any).doGTranslate?.(`fr|${lang}`);
    }
    setSelectedLang(lang);
  };

  if (typeof (window as any).doGTranslate === 'function') {
    applyTranslation();
  } else {
    // Si le script n'est pas encore prêt, attendre 100ms
    setTimeout(applyTranslation, 100);
  }

  // Reload après un court délai pour forcer l'application du cookie
  setTimeout(() => {
    window.location.reload();
  }, 200);
};


    return (
        <>
            <style jsx global>{`
                .goog-te-banner-frame.skiptranslate,
                body > .skiptranslate,
                iframe.goog-te-banner-frame,
                iframe#\\:1\\.container {
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
