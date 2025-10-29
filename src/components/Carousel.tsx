import React, { useMemo } from 'react';
import { carouselImages, ImagePlaceholder } from '../lib/placeholder-images';

const FALLBACK_IMAGE = '/images/fallback.png';

const Carousel: React.FC = () => {
  // Sélectionne 3 images aléatoires à chaque rendu
  const randomImages = useMemo(() => {
    if (carouselImages.length <= 3) return carouselImages;
    const shuffled = [...carouselImages].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        gap: '16px',
        padding: '16px',
        overflowX: 'auto', // permet le scroll horizontal
        scrollbarWidth: 'none', // pour Firefox
      }}
    >
      {randomImages.map((image: ImagePlaceholder) => (
        <div
          key={image.id}
          style={{
            flex: '0 0 auto', // empêche le shrink, garde la taille
            minWidth: '150px', // largeur minimale pour mobile
            maxWidth: '80vw', // ne dépasse jamais 80% de l'écran
            textAlign: 'center',
          }}
        >
          <img
            src={image.imageUrl || FALLBACK_IMAGE}
            alt=""
            style={{
              width: '100%',
              height: 'auto', // hauteur adaptative
              objectFit: 'cover',
              borderRadius: '8px',
            }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default Carousel;
