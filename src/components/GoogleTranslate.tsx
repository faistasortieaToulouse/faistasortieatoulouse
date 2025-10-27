'use client';

import { useEffect, useState } from 'react';
// Suppression de l'import de 'next/script' car nous utilisons la méthode Vanilla JS via useEffect.

const LANGS: { code: string; label: string }[] = [
    { code: 'fr', label: 'Français' },
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

// Langue source (par défaut de l'application)
const PAGE_LANGUAGE = 'fr';

// Fonctions utilitaires protégées contre le SSR
function setCookie(name: string, value: string, days?: number) {
    if (typeof document === 'undefined') return;

    let cookie = `${name}=${value};path=/;`;
    
    // Sur localhost, ne pas définir domain (évite erreurs de sécurité)
    if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        if (host !== 'localhost' && host.indexOf('.') !== -1) {
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


// Rétablit le nom de la fonction à GoogleTranslate pour la cohérence
export default function GoogleTranslate() { 
    const [selectedLang, setSelectedLang] = useState('');

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // --------------------------------------------------------
        // CORRECTION DE L'INITIALISATION DU FRANÇAIS PAR DÉFAUT
        // --------------------------------------------------------
        let currentCookie = getCookie('googtrans');
        const defaultCookieValue = `/${PAGE_LANGUAGE}/${PAGE_LANGUAGE}`;

        // 1. Si le cookie n'existe pas ou pointe vers la langue par défaut,
        // on s'assure qu'il est bien défini pour 'fr'.
        if (!currentCookie || currentCookie.endsWith(`/${PAGE_LANGUAGE}`)) {
             setCookie('googtrans', defaultCookieValue, 7);
             currentCookie = defaultCookieValue;
        }

        const langCode = currentCookie.split('/')[2] || PAGE_LANGUAGE;
        setSelectedLang(langCode);

        // 2) Définit callback global AVANT le chargement du script
        if (!(window as any).googleTranslateElementInit) {
            (window as any).googleTranslateElementInit = function () {
                try {
                    new (window as any).google.translate.TranslateElement(
                        {
                            pageLanguage: PAGE_LANGUAGE,
                            includedLanguages: LANGS.map(l => l.code).join(','),
                            // Utilise SIMPLE layout pour minimiser les éléments Google
                            layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE, 
                            autoDisplay: false,
                        },
                        // Utilise un ID CACHÉ pour l'initialisation de Google Translate
                        'google_translate_element_hidden'
                    );
                } catch (e) {
                    console.error("Erreur lors de l'initialisation de Google Translate:", e);
                }
            };
        }

        // 3) Charger le script une seule fois si nécessaire (méthode Vanilla JS)
        const SCRIPT_ID = 'google-translate-script';
        if (!document.getElementById(SCRIPT_ID)) {
            const s = document.createElement('script');
            s.id = SCRIPT_ID;
            s.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            s.async = true;
            document.body.appendChild(s);
        }
        
    }, []);

    const changeLang = (lang: string) => {
        if (typeof window === 'undefined') return;
        
        // Si l'utilisateur choisit 'fr', on force le cookie à /fr/fr pour réinitialiser la traduction
        const targetLang = lang === PAGE_LANGUAGE ? PAGE_LANGUAGE : lang; 

        setSelectedLang(lang);

        const val = `/${PAGE_LANGUAGE}/${targetLang}`;
        setCookie('googtrans', val, 7);
        setCookie('googtrans', val);
        
        // Recharge la page pour appliquer la traduction
        window.location.reload();
    };

    return (
        <div className="google-translate-custom flex items-center space-x-2">
            {/* ------------------------------------------------------------------------------------------ */}
            {/* Conteneur Google (caché) avec masquage CSS intégré pour la barre supérieure. */}
            {/* C'est cet élément qui empêche la barre de s'afficher. */}
            {/* ------------------------------------------------------------------------------------------ */}
            <div
                id="google_translate_element_hidden"
                // Positionne l'élément complètement hors de l'écran (masquage fiable)
                className="absolute left-[-9999px] top-[-9999px] w-[1px] h-[1px] overflow-hidden"
                // Cache l'élément lui-même
                style={{ display: 'none', visibility: 'hidden' }}
            >
                {/* Cette balise script injecte le CSS pour masquer l'élément de Google qui crée la barre */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            /* CORRECTION CLÉ: Masque la barre de bannière supérieure (le bandeau bleu/gris) */
                            .goog-te-banner-frame.skiptranslate { display: none !important; visibility: hidden !important; }
                            
                            /* Neutralise le décalage du corps de page (Google ajoute un padding-top ou un top: 40px) */
                            body { top: 0 !important; }
                            
                            /* Masque le sélecteur natif qui pourrait fuir du conteneur caché */
                            #google_translate_element_hidden .goog-te-gadget-simple { display: none !important; visibility: hidden !important; }
                            
                            /* Masque les tooltips */
                            .goog-tooltip, #goog-gt-tt { display: none !important; visibility: hidden !important; }
                        `,
                    }}
                />
            </div>
            
            {/* UI custom : sélecteur de langue */}
            <label htmlFor="my-gg-select" className="sr-only">Langue</label>
            <select
                id="my-gg-select"
                onChange={(e) => changeLang(e.target.value)}
                value={selectedLang} 
                aria-label="Sélectionner une langue"
                className="px-2 py-1 rounded border shadow-sm bg-card hover:bg-muted/70 transition-colors"
            >
                {/* On s'assure que 'fr' est sélectionnable pour un retour à la langue native */}
                <option value={PAGE_LANGUAGE}>Français (par défaut)</option> 
                {LANGS.filter(l => l.code !== PAGE_LANGUAGE).map(l => (
                    <option key={l.code} value={l.code}>
                        {l.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
