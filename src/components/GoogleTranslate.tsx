'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function GoogleTranslate() {
  const router = useRouter();

  useEffect(() => {
    const addScript = () => {
      // Supprime l'ancien script s'il existe
      const oldScript = document.getElementById('google-translate-script');
      if (oldScript) oldScript.remove();

      // Ajoute le script
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(script);
    };

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: 'fr' },
        'google_translate_element'
      );
    };

    addScript();

    router.events.on('routeChangeComplete', addScript);
    return () => router.events.off('routeChangeComplete', addScript);
  }, [router.events]);

  return <div id="google_translate_element"></div>;
}
