import React, { useMemo } from 'react';
import { carouselImages, ImagePlaceholder } from '../lib/placeholder-images';

const FALLBACK_IMAGE = '/images/fallback.png';

const Carousel: React.FC = () => {
  // Sélectionne le logo + 2 images aléatoires
  const displayImages = useMemo(() => {
    const logoImage = carouselImages.find(img => img.id === 'fts-logo');
    const otherImages = carouselImages.filter(img => img.id !== 'fts-logo');
    const shuffled = otherImages.sort(() => 0.5 - Math.random()).slice(0, 2);
    return logoImage ? [logoImage, ...shuffled] : shuffled;
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        gap: '16px',
        padding: '16px',
        overflowX: 'auto',
        scrollbarWidth: 'none', // cache scrollbar Firefox
      }}
    >
      {displayImages.map((image: ImagePlaceholder) => (
        <div
          key={image.id}
          style={{
            flex: '0 0 auto',       // empêche le shrink
            minWidth: '120px',      // largeur minimale mobile
            maxWidth: '300px',      // largeur maximale desktop
            width: 'calc(33.33% - 16px)', // 3 images visibles sur desktop
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
