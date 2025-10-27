'use client';

import { useEffect, useState } from 'react'; // 👈 Import de useState

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

// Fonctions utilitaires protégées contre le SSR
function setCookie(name: string, value: string, days?: number) {
    if (typeof document === 'undefined') return;

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
    if (typeof document === 'undefined') return null;

    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}


export default function GoogleTranslateCustom() {
    // -----------------------------------------------------------------
    // AMÉLIORATION : Utilisation de l'état pour contrôler le sélecteur
    // -----------------------------------------------------------------
    // Extrait la langue cible actuelle du cookie, ou vide si non trouvé
    const [selectedLang, setSelectedLang] = useState('');

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Lis le cookie au montage initial et met à jour l'état
        const currentCookie = getCookie('googtrans');
        const langCode = currentCookie?.split('/')[2] || '';
        setSelectedLang(langCode);

        // 1) Définit callback global AVANT le chargement du script
        if (!(window as any).googleTranslateElementInit) {
            (window as any).googleTranslateElementInit = function () {
                try {
                    new (window as any).google.translate.TranslateElement(
                        {
                            pageLanguage: 'fr',
                            // IMPORTANT : Limite les langues incluses au tableau LANGS
                            includedLanguages: LANGS.map(l => l.code).join(','),
                            layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
                            autoDisplay: false,
                        },
                        'google_translate_element_hidden' // conteneur caché
                    );
                } catch (e) {
                    // ignore
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
        
    }, []);

    // Lorsque l'utilisateur choisit une langue :
    const changeLang = (lang: string) => {
        if (typeof window === 'undefined') return;
        
        // 1. Mise à jour de l'état local avant le rechargement
        setSelectedLang(lang); // Maintient l'UI synchro pendant le micro-délai

        // 2. Configuration du cookie
        const val = `/fr/${lang}`;
        setCookie('googtrans', val, 7);
        setCookie('googtrans', val);
        
        // 3. Rechargement de la page pour activer la traduction Google
        window.location.reload();
    };

    return (
        <div className="google-translate-custom flex items-center space-x-2">
            {/* Conteneur Google (caché) */}
            {/* Je renforce le masquage en le mettant en position absolue hors écran */}
            <div
                id="google_translate_element_hidden"
                // J'utilise `absolute` et `left-[-9999px]` pour le sortir complètement du flux
                className="absolute left-[-9999px] top-[-9999px] w-[1px] h-[1px] overflow-hidden" 
            />

            {/* UI custom */}
            <label htmlFor="my-gg-select" className="sr-only">Langue</label>
            <select
                id="my-gg-select"
                onChange={(e) => changeLang(e.target.value)}
                value={selectedLang} // 👈 Utilise l'état local 'value'
                aria-label="Sélectionner une langue"
                className="px-2 py-1 rounded border shadow-sm bg-card hover:bg-muted/70 transition-colors"
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
        </div>
    );
}
