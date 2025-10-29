import React, { useMemo } from 'react';
import { carouselImages, ImagePlaceholder } from '../lib/placeholder-images';

const FALLBACK_IMAGE = '/images/fallback.png';

const Carousel: React.FC = () => {
  // Sélectionne le logo + 3 images aléatoires
  const displayImages = useMemo(() => {
    const logoImage = carouselImages.find(img => img.id === 'fts-logo');
    const otherImages = carouselImages.filter(img => img.id !== 'fts-logo');
    const needed = Math.min(3, otherImages.length); // prend 3 images supplémentaires
    const shuffled = otherImages.sort(() => 0.5 - Math.random()).slice(0, needed);
    return logoImage ? [logoImage, ...shuffled] : shuffled;
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        padding: '12px',
        overflowX: 'auto',
        scrollbarWidth: 'none', // cache scrollbar Firefox
      }}
    >
      {displayImages.map((image: ImagePlaceholder) => (
        <div
          key={image.id}
          style={{
            flex: '0 0 auto',       // empêche le shrink
            width: '80vw',          // largeur adaptée aux mobiles
            maxWidth: '300px',      // limite sur desktop
            minWidth: '120px',      // minimum pour très petits écrans
            textAlign: 'center',
          }}
        >
          <img
            src={image.imageUrl || FALLBACK_IMAGE}
            alt={image.description || 'LogoFTS'}
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
