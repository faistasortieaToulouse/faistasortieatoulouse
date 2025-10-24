'use client';

import Image from "next/image";
import { useEffect, useState } from "react";

export function InstallPWAiOS() {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Détecte si l’app est déjà installée en standalone
    if (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }
  }, []);

  if (isStandalone) return null; // ne pas afficher si déjà installé

  return (
    <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-700 border rounded-lg shadow-md max-w-xs">
      {/* Icône de l'application */}
      <div className="mb-3">
        <Image
          src="/images/app-icon.png"
          alt="Icône de l'application"
          width={80}
          height={80}
          className="rounded-lg"
        />
      </div>

      {/* Titre */}
      <h3 className="font-bold text-center text-gray-800 dark:text-white mb-2">
        Installer l'App sur iPhone / iPad
      </h3>

      {/* Instructions */}
      <p className="text-sm text-center text-gray-600 dark:text-gray-300 mb-3">
        Pour installer, appuyez sur <strong>Partager</strong> puis <strong>Ajouter à l’écran d’accueil</strong>.
      </p>

      {/* Exemple visuel */}
      <div className="relative w-full h-20 mb-2">
        <Image
          src="/images/pwa-ios-guide.png"
          alt="Guide Installation PWA iOS"
          fill
          className="object-contain"
        />
      </div>

      <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Vous pourrez ensuite lancer l’application directement depuis votre écran d’accueil.
      </span>
    </div>
  );
}
