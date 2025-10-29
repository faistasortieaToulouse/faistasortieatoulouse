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
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}
    >
      {randomImages.map((image: ImagePlaceholder) => (
        <div
          key={image.id}
          style={{
            flex: '0 0 auto',
            minWidth: '120px',
            width: 'calc(33.33% - 16px)', // 3 images visibles sur grand écran
            maxWidth: '300px', // limite la taille sur desktop
            textAlign: 'center',
          }}
        >
          <img
            src={image.imageUrl || FALLBACK_IMAGE}
            alt=""
            style={{
              width: '100%',
              height: 'auto',
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
