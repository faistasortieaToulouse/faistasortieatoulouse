'use client';

import React, { useEffect, useState } from "react";
// Simulation des composants Next.js/bibliothèques
const Image = ({ src, alt, width, height, className = '' }) => (
    <img src={src} alt={alt} style={{ width: width, height: height, maxWidth: '100%' }} className={className} />
);
// Simulation de QRCodeCanvas
const QRCodeCanvas = ({ value, size, className = '' }) => (
    <div className={`p-2 border border-gray-300 bg-gray-50 flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <span className="text-xs text-gray-500">QR Code: {value.substring(0, 20)}...</span>
    </div>
);

// --- Détection iOS Améliorée (plus robuste) ---
const isIOS = () => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    // 1. Détection classique (iPhone, iPad, iPod)
    const isClassicIOS = /iPad|iPhone|iPod/.test(userAgent);
    // 2. Détection pour iPad sur macOS (depuis iOS 13)
    const isModernIOS = userAgent.includes("Mac") && 'ontouchend' in document;

    return isClassicIOS || isModernIOS;
};

// Détection Desktop Améliorée
const isDesktop = () => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    return !isMobile;
};
// ---------------------------------------------


export default function InstallPWAiOS() {
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('loading');
  const [isStandalone, setIsStandalone] = useState(false);
  const appUrl = typeof window !== 'undefined' ? window.location.href : 'https://mon-appli-fictive.com';

  useEffect(() => {
    if (isIOS()) {
        setDeviceType('ios');
    } else if (/Android/.test(navigator.userAgent || navigator.vendor)) {
        setDeviceType('android');
    } else if (isDesktop()) {
        setDeviceType('desktop');
    } else {
        setDeviceType('desktop'); // Fallback to desktop/other if neither iOS nor Android explicit
    }

    // Vérifie si la PWA est déjà ouverte en standalone
    if (('standalone' in window.navigator && (window.navigator as any).standalone) ||
        window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }
  }, []);

  if (isStandalone || deviceType === 'loading') return null; // Ne rien afficher si déjà installée ou en chargement

  return (
    <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-700 border border-indigo-200 dark:border-indigo-600 rounded-xl shadow-lg max-w-sm mx-auto w-full">
        
      {/* iOS: Affichage du Guide d'installation PWA */}
      {deviceType === 'ios' && (
        <>
          <Image src="/images/app-icon.png" alt="App Icon" width={80} height={80} className="rounded-2xl mb-4 shadow-md" />
          <h3 className="font-bold text-xl text-indigo-700 dark:text-indigo-300 mb-2 text-center">
            Installer sur iPhone / iPad
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-400 mb-4 text-center">
            Pour ajouter l’application à l’écran d’accueil sur iPhone (Safari uniquement) :
          </p>
          
          <div className="bg-indigo-50 dark:bg-gray-800 p-3 rounded-lg w-full">
            <ol className="list-decimal list-inside text-sm text-gray-800 dark:text-gray-200 space-y-2">
                <li>
                    Appuyez sur l'icône de <strong className="text-indigo-600 dark:text-indigo-400">Partage</strong> 
                    {/* Icône de partage iOS */}
                    <span className="inline-block align-middle mx-1">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500 inline-block align-middle">
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                            <polyline points="16 6 12 2 8 6"></polyline>
                            <line x1="12" y1="2" x2="12" y2="15"></line>
                        </svg>
                    </span> 
                    dans la barre inférieure de Safari.
                </li>
                <li>
                    Sélectionnez <strong className="text-green-600 dark:text-green-400">"Sur l'écran d'accueil"</strong> (Add to Home Screen).
                </li>
            </ol>
          </div>
          {/* Image du guide iOS non incluse car c'est un asset local, on garde les instructions textuelles */}
        </>
      )}

      {/* Android: Ne rien afficher ici si l'APK est géré dans le DashboardClient */}
      {/* On pourrait afficher un message générique PWA si nécessaire */}
      {deviceType === 'android' && (
          <div className="text-center">
             <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-2">PWA Android</h3>
             <p className="text-sm text-gray-600 dark:text-gray-300">
                Vous pouvez installer l'application via la bannière PWA (si configurée) ou par le Play Store ci-dessus.
             </p>
          </div>
      )}

      {/* Desktop / tablette: Affichage du QR code */}
      {deviceType === 'desktop' && (
        <>
          <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-3 text-center">Version mobile disponible</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 text-center">
            Scannez ce QR code pour accéder à l’application sur votre téléphone :
          </p>
          <div className="p-3 bg-white rounded-lg shadow-inner">
            <QRCodeCanvas value={appUrl} size={120} />
          </div>
        </>
      )}

    </div>
  );
}
