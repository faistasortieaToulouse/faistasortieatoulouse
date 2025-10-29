'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation'; // ⬅️ IMPORT NÉCESSAIRE POUR NEXT.JS

// ⭐️ DÉFINITION DE L'INTERFACE ⭐️
interface Language {
  code: string;
  label: string;
}

// ⭐️ APPLIQUER LE TYPE À LANGS ⭐️
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

// ⭐️ APPLIQUER LE TYPE À EXTRA_LANGS ⭐️
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

// --- (Vos fonctions setCookie et getCookie sont conservées) ---
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

// 💡 Fonction utilitaire pour déclencher la traduction manuellement
const triggerGoogleTranslate = () => {
    // 1. Tente de trouver le sélecteur masqué de Google
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    
    // 2. Tente de trouver la langue cible à partir du cookie
    const currentCookie = getCookie('googtrans');
    const targetLang = currentCookie?.split('/')[2];

    if (select && targetLang && targetLang !== 'fr') {
        // 3. Force la valeur sur le sélecteur masqué et déclenche l'événement 'change'
        select.value = targetLang;
        select.dispatchEvent(new Event('change'));
    }
};

export default function GoogleTranslateCustom() {
    const pathname = usePathname(); // ⬅️ Hook pour détecter la navigation
    const [selectedLang, setSelectedLang] = useState('fr');
    const [scriptReady, setScriptReady] = useState(false);
    const [showExtra, setShowExtra] = useState(false);

    // 1. useEffect d'initialisation (identique)
    useEffect(() => {
        const cookie = getCookie('googtrans');
        const currentLang = cookie?.split('/')[2];

        if (!cookie || !currentLang) {
            setCookie('googtrans', '/fr/fr', 7);
        }

        setSelectedLang(currentLang || 'fr');
        setScriptReady(true);

        // ... (Votre intervalle pour masquer la bannière est conservé)
        const interval = setInterval(() => {
            const bannerFrame = document.querySelector('iframe.goog-te-banner-frame') as HTMLIFrameElement | null;
            if (bannerFrame) {
                // Vos styles pour la bannière
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
        // Ce code s'exécute à chaque navigation côté client (changement de pathname)
        if (scriptReady) {
            // Un petit délai (50ms) est crucial pour laisser le temps au nouveau contenu 
            // de la page d'être rendu avant de déclencher la traduction.
            setTimeout(triggerGoogleTranslate, 50); 
        }
    }, [pathname, scriptReady]); // S'exécute quand la route change

    
    // 3. Fonction changeLang mise à jour pour éviter le window.location.reload()
    const changeLang = (lang: string) => {
        if (lang === selectedLang) return;
        const val = `/fr/${lang}`;
        setCookie('googtrans', val, 7);

        setSelectedLang(lang); // Met à jour l'affichage de votre select

        // Tente de déclencher la traduction sans recharger la page
        if (typeof window !== 'undefined' && window.google?.translate?.TranslateElement) {
            const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
            
            if (combo) {
                combo.value = lang; 
                combo.dispatchEvent(new Event('change')); // Déclenche la traduction
            } else {
                 // Fallback si le widget n'est pas prêt, mais ce cas devrait être rare après l'init
                 window.location.reload(); 
            }
        } else {
             // Fallback pour la première sélection
             window.location.reload();
        }
    };


    return (
        // --- Votre JSX de rendu reste inchangé ---
        <>
            {/* ... styles globaux ... */}
            <style jsx global>{`...`}</style>

            {/* Div cachée pour le widget Google */}
            <div id="google_translate_element" style={{ display: 'none' }} />

            {scriptReady && (
                <>
                    {/* Script principal */}
                    <Script
                        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
                        strategy="afterInteractive"
                    />
                    {/* Script d'initialisation */}
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

            {/* Votre sélecteur de langue personnalisé (le reste du JSX) */}
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
