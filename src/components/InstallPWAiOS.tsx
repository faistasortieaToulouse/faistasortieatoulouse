'use client';

// --- IMPORTS RÉELS (Remplacés pour compatibilité) ---
// Remplacement des imports spécifiques à Next.js et qrcode.react par des imports React de base
import { useEffect, useState } from "react"; 
// ---------------------------------------------------------------------

// --- Ressources d'images (à adapter si vous les placez dans /public) ---
// Note: J'utilise ici les noms de fichiers que vous avez fournis.
// Assurez-vous que ces fichiers sont bien placés dans le dossier /public de votre projet Next.js.

const SAFARI_SHARE_ICON_SRC = "/Copilot_20251106_212349.jpg";
const ADD_TO_HOME_SCREEN_GUIDE_SRC = "/Gemini_Generated_Image_94f0j894f0j894f0.jpg";
const APP_ICON_PLACEHOLDER_SRC = "/images/app-icon.png";
const GOOGLE_PLAY_BADGE_SRC = "/images/google-play-badge.png";
// ---------------------------------------------------------------------


// --- Fonctions de Détection d'Appareil Améliorées ---

/**
 * Détecte les appareils iOS, y compris les iPads sous userAgent de Mac.
 */
const isIOS = () => {
    // Vérification de l'existence de 'window' pour éviter les erreurs de SSR
    if (typeof window === 'undefined') return false; 
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
    if (typeof window === 'undefined') return true; // Considérer comme desktop en SSR
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    // La détection de l'iPhone a été renforcée dans isIOS(), donc si on n'est ni Android ni iOS, c'est Desktop.
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    return !isMobile;
};
// --------------------------------------------------


// Remplacement du composant QrCodeBlock par une version sans dépendance externe.
// Si vous réintroduisez la bibliothèque qrcode.react dans votre projet Next.js, vous pourrez 
// rétablir le composant original.
const QrCodeBlock = ({ appUrl, title, device }: { appUrl: string, title: string, device: 'ios' | 'android' | 'desktop' }) => (
    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">
            {title} (Affiché pour: {device.toUpperCase()})
        </p>
        <div className="p-4 bg-white rounded-lg shadow-inner mx-auto w-fit border border-gray-300">
            <p className="text-center text-xs text-gray-800">
                Lien direct vers l'application :
            </p>
            {/* Simulation de l'emplacement du QR Code */}
            <a 
                href={appUrl} 
                className="block text-indigo-500 hover:text-indigo-600 truncate max-w-[150px] mx-auto text-sm mt-1" 
                target="_blank"
                rel="noopener noreferrer"
            >
                {/* Affiche le domaine du site */}
                {appUrl.replace(/^https?:\/\//, '').split('/')[0]} 
            </a>
            <p className="text-center text-xs text-gray-500 mt-2">
                (QR Code indisponible sans la librairie `qrcode.react`)
            </p>
        </div>
    </div>
);


export default function InstallPWAiOS() {
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop' | 'loading'>('loading');
  const [isStandalone, setIsStandalone] = useState(false);
  
  // Utiliser la location actuelle pour le QR code
  const appUrl = typeof window !== 'undefined' ? window.location.href : 'https://faistasortieatoulouse.online';

  useEffect(() => {
    // Exécuter la détection côté client
    if (isIOS()) {
        setDeviceType('ios');
    } else if (typeof navigator !== 'undefined' && /Android/.test(navigator.userAgent || navigator.vendor)) {
        setDeviceType('android');
    } else if (isDesktop()) {
        setDeviceType('desktop');
    } else {
        setDeviceType('desktop'); // Fallback sécuritaire
    }

    // Vérifie si la PWA est déjà ouverte en standalone
    if (typeof window !== 'undefined' && (('standalone' in window.navigator && (window.navigator as any).standalone) ||
        window.matchMedia('(display-mode: standalone)').matches)) {
      setIsStandalone(true);
    }
  }, []);

  // Ne rien afficher si déjà installée ou en cours de chargement
  if (isStandalone || deviceType === 'loading') return null; 

  // Remplacement de <Image /> par <img /> standard pour éviter la dépendance 'next/image'
  const ImageComponent = ({ src, alt, width, height, className }: { src: string, alt: string, width: number, height: number, className: string }) => (
      // Ajout de style pour garantir la taille, car les balises <img> simples n'ont pas le comportement de Next Image
      <img src={src} alt={alt} width={width} height={height} className={className} style={{ width: `${width}px`, height: `${height}px`, objectFit: 'contain' }} />
  );

  return (
    <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-700 border border-indigo-200 dark:border-indigo-600 rounded-xl shadow-lg max-w-sm mx-auto w-full">
        
      {/* iOS: Guide d'installation PWA amélioré (pour les iPhones/iPads) */}
      {deviceType === 'ios' && (
        <>
          {/* Remplacé par <ImageComponent /> */}
          <ImageComponent src={APP_ICON_PLACEHOLDER_SRC} alt="App Icon" width={80} height={80} className="rounded-2xl mb-4 shadow-md" />
          
          <h3 className="font-bold text-xl text-indigo-700 dark:text-indigo-300 mb-2 text-center">
            Installation rapide sur iPhone / iPad
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-400 mb-4 text-center">
            Suivez ces deux étapes simples dans le navigateur Safari pour ajouter l’appli à votre écran d’accueil :
          </p>
          
          <div className="bg-indigo-50 dark:bg-gray-800 p-4 rounded-lg w-full space-y-4">
            <ol className="list-decimal list-inside text-sm text-gray-800 dark:text-gray-200 space-y-3">
              <li className="flex items-center">
                {/* ÉTAPE 1: Image du bouton de partage */}
                <span className="font-semibold mr-2">1.</span>
                <span className="flex-grow">
                    Appuyez sur l'icône de <strong className="text-indigo-600 dark:text-indigo-400">Partage</strong>
                </span>
                {/* Remplacé par <ImageComponent /> */}
                <ImageComponent 
                    src={SAFARI_SHARE_ICON_SRC} 
                    alt="Icône de Partage Safari (carré avec flèche)" 
                    width={24} 
                    height={24} 
                    className="inline-block align-middle ml-2" 
                />
              </li>
              <li className="flex items-center">
                {/* ÉTAPE 2: Texte pour l'action */}
                <span className="font-semibold mr-2">2.</span>
                Sélectionnez <strong className="text-green-600 dark:text-green-400">"Ajouter à l’écran d’accueil"</strong> (Add to Home Screen) dans le menu.
              </li>
            </ol>
            
            {/* Réf. Visuelle de l'étape 2 (La boîte de dialogue) */}
            <div className="pt-3 border-t border-indigo-200 dark:border-gray-700">
                <p className="text-xs italic text-gray-600 dark:text-gray-400 mb-2 text-center">
                    C’est l’écran de confirmation que vous cherchez :
                </p>
                {/* Remplacé par <ImageComponent /> */}
                <ImageComponent 
                    src={ADD_TO_HOME_SCREEN_GUIDE_SRC} 
                    alt="Guide visuel Ajouter à l'écran d'accueil" 
                    width={200} 
                    height={180}
                    className="mx-auto rounded-xl shadow-lg border border-gray-300 dark:border-gray-600"
                />
            </div>
          </div>

          {/* AJOUT DU QR CODE POUR iOS (Remplacé par lien direct) */}
          <QrCodeBlock 
            appUrl={appUrl} 
            title="Ou partagez le lien directement" 
            device="ios"
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
            {/* Remplacé par <ImageComponent /> */}
            <a href="https://play.google.com/store/apps/details?id=com.votre.appli.android" target="_blank" rel="noopener noreferrer" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <ImageComponent src={GOOGLE_PLAY_BADGE_SRC} alt="Disponible sur Google Play" width={160} height={48} className="mx-auto" />
            </a>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
              *Ou utilisez la bannière d'installation PWA si elle apparaît.
            </p>

            {/* AJOUT DU QR CODE POUR Android (Remplacé par lien direct) */}
            <QrCodeBlock 
                appUrl={appUrl} 
                title="Ou partagez le lien directement" 
                device="android"
            />
        </>
      )}

      {/* Desktop / Fallback: Affichage du QR code (Remplacé par lien direct) */}
      {deviceType === 'desktop' && (
        <>
          <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-3 text-center">Version mobile disponible</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 text-center">
            Utilisez ce lien pour accéder à l’application sur votre téléphone :
          </p>
          <div className="p-3 bg-white rounded-lg shadow-inner mx-auto w-fit">
            {/* Remplacé par lien direct */}
            <QrCodeBlock 
                appUrl={appUrl} 
                title="Lien mobile" 
                device="desktop"
            />
          </div>
        </>
      )}

    </div>
  );
}
