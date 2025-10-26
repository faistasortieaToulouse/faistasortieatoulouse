'use client';

// --- VOS IMPORTS RÉELS (SIMULATION POUR LA COMPILATION) ---
// NOTE IMPORTANTE: Les imports réels suivants sont COMMENTÉS et SIMULÉS ci-dessous,
// car les modules "next/image" et "qrcode.react" ne sont pas disponibles dans cet environnement.
// import Image from "next/image"; 
// import { QRCodeCanvas } from "qrcode.react"; 
import { useEffect, useState } from "react"; 

// --- DÉFINITION DE TYPES POUR LA SIMULATION ---
interface ImageProps {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
}

interface QRCodeCanvasProps {
    value: string;
    size: number;
    className?: string;
    level?: 'L' | 'M' | 'Q' | 'H'; // Typage plus strict du level
    bgColor?: string;
    fgColor?: string;
}
// ---------------------------------------------


// --- Simulation des composants externes (À RETIRER DANS VOTRE PROJET LOCAL) ---
// Le composant Image utilise maintenant le type ImageProps
const Image = ({ src, alt, width, height, className = '' }: ImageProps) => (
    // Remplacement simple par une balise img HTML
    <img 
        src={src} 
        alt={alt} 
        style={{ width: width, height: height, maxWidth: '100%', display: 'block', margin: '0 auto' }} 
        className={className} 
        // Ajout d'une gestion d'erreur visuelle si l'image ne charge pas
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; console.error('Image non trouvée:', src); }}
    />
);

// Le composant QRCodeCanvas utilise maintenant le type QRCodeCanvasProps
const QRCodeCanvas = ({ value, size, className = '', ...props }: QRCodeCanvasProps) => (
    // Remplacement du composant réel par un simple div de placeholder (avec taille respectée)
    <div className={`p-3 border border-gray-300 bg-gray-50 flex items-center justify-center ${className} rounded-lg`} style={{ width: size, height: size }}>
        <span className="text-xs text-gray-500 font-mono text-center break-all">QR Code Placeholder ({value.substring(0, 20)}...)</span>
    </div>
);
// ---------------------------------------------------------------------


// --- Fonctions de Détection d'Appareil Améliorées ---

/**
 * Détecte les appareils iOS, y compris les iPads sous userAgent de Mac.
 */
const isIOS = () => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    // 1. Détection classique (iPhone, iPad, iPod)
    const isClassicIOS = /iPad|iPhone|iPod/.test(userAgent);
    // 2. Détection pour iPad sur macOS (depuis iOS 13)
    const isModernIOS = userAgent.includes("Mac") && 'ontouchend' in document;

    return isClassicIOS || isModernIOS;
};

/**
 * Détecte si l'appareil est un ordinateur de bureau (non mobile).
 */
const isDesktop = () => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    // La détection de l'iPhone a été renforcée dans isIOS(), donc si on n'est ni Android ni iOS, c'est Desktop.
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    return !isMobile;
};
// --------------------------------------------------


const QrCodeBlock = ({ appUrl, title }: { appUrl: string, title: string }) => (
    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">
            {title}
        </p>
        <div className="p-2 bg-white rounded-lg shadow-inner mx-auto w-fit">
            <QRCodeCanvas 
                value={appUrl} 
                size={120} 
                level="H" 
                bgColor="#ffffff"
                fgColor="#000000"
                className="rounded-md"
            />
        </div>
    </div>
);


export default function InstallPWAiOS() {
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop' | 'loading'>('loading');
  const [isStandalone, setIsStandalone] = useState(false);
  // Utiliser la location actuelle pour le QR code
  const appUrl = typeof window !== 'undefined' ? window.location.href : 'https://mon-appli-fictive.com';

  useEffect(() => {
    // Exécuter la détection côté client
    if (isIOS()) {
        setDeviceType('ios');
    } else if (/Android/.test(navigator.userAgent || navigator.vendor)) {
        setDeviceType('android');
    } else if (isDesktop()) {
        setDeviceType('desktop');
    } else {
        setDeviceType('desktop'); // Fallback sécuritaire
    }

    // Vérifie si la PWA est déjà ouverte en standalone
    if (('standalone' in window.navigator && (window.navigator as any).standalone) ||
        window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }
  }, []);

  // Ne rien afficher si déjà installée ou en cours de chargement
  if (isStandalone || deviceType === 'loading') return null; 

  return (
    <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-700 border border-indigo-200 dark:border-indigo-600 rounded-xl shadow-lg max-w-sm mx-auto w-full">
        
      {/* iOS: Guide d'installation PWA amélioré (pour les iPhones/iPads) */}
      {deviceType === 'ios' && (
        <>
          {/* Rétablissement de l'icône de l'application pour l'affichage iOS */}
          <Image src="/images/app-icon.png" alt="App Icon" width={80} height={80} className="rounded-2xl mb-4 shadow-md" />
          
          <h3 className="font-bold text-xl text-indigo-700 dark:text-indigo-300 mb-2 text-center">
            Installer sur iPhone / iPad
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-400 mb-4 text-center">
            Pour ajouter l’application à l’écran d’accueil (Safari uniquement) :
          </p>
          
          <div className="bg-indigo-50 dark:bg-gray-800 p-3 rounded-lg w-full">
            <ol className="list-decimal list-inside text-sm text-gray-800 dark:text-gray-200 space-y-2">
                <li>
                    Appuyez sur l'icône de <strong className="text-indigo-600 dark:text-indigo-400">Partage</strong> 
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
                    Sélectionnez <strong className="text-green-600 dark:text-green-400">"Ajouter à l’écran d’accueil"</strong> (Add to Home Screen).
                </li>
            </ol>
          </div>

          {/* AJOUT DU QR CODE POUR iOS */}
          <QrCodeBlock 
            appUrl={appUrl} 
            title="Ou scannez pour partager le lien : " 
          />
        </>
      )}

      {/* Android: Affichage du badge Play Store (reprise de votre ancienne logique) */}
      {deviceType === 'android' && (
        <>
            <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-2 text-center">Installer l'application sur Android</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 text-center">
              Téléchargez l'application PWA depuis le Play Store (TWA) :
            </p>
            <a href="https://play.google.com/store/apps/details?id=com.votre.appli.android" target="_blank" rel="noopener noreferrer" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Image src="/images/google-play-badge.png" alt="Disponible sur Google Play" width={160} height={48} className="mx-auto" />
            </a>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
              *Ou utilisez la bannière d'installation PWA si elle apparaît.
            </p>

            {/* AJOUT DU QR CODE POUR Android */}
            <QrCodeBlock 
                appUrl={appUrl} 
                title="Ou scannez pour partager le lien : " 
            />
        </>
      )}

      {/* Desktop / Fallback: Affichage du QR code (pour scanner avec un mobile) */}
      {deviceType === 'desktop' && (
        <>
          <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-3 text-center">Version mobile disponible</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 text-center">
            Scannez ce QR code pour accéder à l’application sur votre téléphone :
          </p>
          <div className="p-3 bg-white rounded-lg shadow-inner mx-auto w-fit">
            <QRCodeCanvas 
                value={appUrl} 
                size={120} 
                level="H" 
                bgColor="#ffffff"
                fgColor="#000000"
                className="rounded-md"
            />
          </div>
        </>
      )}

    </div>
  );
}
