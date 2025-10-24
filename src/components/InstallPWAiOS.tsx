'use client';

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function InstallPWAiOS() {
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;

    if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) {
      setDeviceType('ios');
    } else if (/Android/.test(ua)) {
      setDeviceType('android');
    } else {
      setDeviceType('desktop');
    }

    // ✅ Correction ici
    if ((window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }
  }, []);

  if (isStandalone) return null;

  if (deviceType === 'desktop') {
    return (
      <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-700 border rounded-lg shadow-md max-w-xs mx-auto">
        <h3 className="font-bold text-gray-800 dark:text-white mb-2 text-center">
          Version mobile disponible
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 text-center">
          Notre application est optimisée pour les téléphones.
          Scannez le QR code pour y accéder :
        </p>
        <Image
          src="/images/qrcode.png"
          alt="QR code vers la version mobile"
          width={120}
          height={120}
          className="rounded-lg mb-3"
        />
        <Button onClick={() => window.history.back()}>⬅️ Retour</Button>
      </div>
    );
  }

  if (deviceType === 'ios') {
    return (
      <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-700 border rounded-lg shadow-md max-w-xs mx-auto">
        <Image
          src="/images/app-icon.png"
          alt="Icône de l'application"
          width={80}
          height={80}
          className="rounded-lg mb-3"
        />
        <h3 className="font-bold text-gray-800 dark:text-white mb-2 text-center">
          Installer l'App sur iPhone / iPad
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 text-center">
          Appuyez sur <strong>Partager</strong> puis <strong>Ajouter à l’écran d’accueil</strong>.
        </p>
        <Image
          src="/images/pwa-ios-guide.png"
          alt="Guide Installation PWA iOS"
          width={200}
          height={60}
          className="object-contain mb-2"
        />
        <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Vous pourrez ensuite lancer l’app directement depuis l’écran d’accueil.
        </span>
      </div>
    );
  }

  if (deviceType === 'android') {
    return (
      <div className="text-center p-4 bg-white dark:bg-gray-700 border rounded-lg shadow-md max-w-xs mx-auto">
        <h3 className="font-bold text-gray-800 dark:text-white mb-2">
          Installer l'App sur Android
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          Téléchargez depuis le Play Store :
        </p>
        <a
          href="https://play.google.com/store/apps/details?id=com.votre.appli.android"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block"
        >
          <Image
            src="/images/google-play-badge.png"
            alt="Disponible sur Google Play"
            width={160}
            height={48}
          />
        </a>
      </div>
    );
  }

  return null;
}
