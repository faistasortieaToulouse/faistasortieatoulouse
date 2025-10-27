'use client';

import { useEffect } from 'react';

export default function GoogleTranslate() {
  useEffect(() => {
    // ✅ Définir le callback global AVANT le chargement du script
    if (!(window as any).googleTranslateElementInit) {
      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: 'fr',
            includedLanguages: 'en,es,it,de,pt,ru,ar,tr,zh-CN,ja', // ✅ Seulement les langues voulues
            layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );
      };
    }

    // ✅ Charger le script une seule fois
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }

    // ✅ Aucun nettoyage : garder le widget stable
  }, []);

  return <div id="google_translate_element" className="mt-2" />;
}
