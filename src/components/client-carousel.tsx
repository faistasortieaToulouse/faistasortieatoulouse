'use client';

// Supprimer placeholderImages car les images sont passées par props
// import placeholderImages from '@/lib/placeholder-images.json'; 

// Garder l'import du type
import { CarouselImage } from '@/types/types'; 

// Assurez-vous d'importer votre composant de rendu final
import { ImageCarousel } from './image-carousel';

// 1. Définir l'interface des props pour accepter le tableau d'images
interface ClientCarouselProps {
  images: CarouselImage[];
}

// 2. Accepter les props et les utiliser directement
export function ClientCarousel({ images }: ClientCarouselProps) {
  // Supprimer tout le useEffect et le useState car les données viennent du parent.

  // 3. Vérification des données (si nécessaire)
  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 font-semibold">
        <span className="text-center p-4">
          Aucune image à afficher. (Vérifiez la source de données dans DashboardCarousel.tsx)
        </span>
      </div>
    );
  }

  // Si vous voulez toujours un tri aléatoire, vous devez le faire ici avant de le passer, 
  // ou mieux, dans le composant parent qui charge les données si elles sont statiques.
  // Pour l'instant, on passe les images telles quelles pour résoudre l'erreur.
  
  // Si vous souhaitez n'afficher que les 3 premières images (comme dans votre ancien useEffect):
  // const imagesToShow = images.slice(0, 3);
  
  // Utiliser toutes les images passées:
  return <ImageCarousel images={images} />;
}
