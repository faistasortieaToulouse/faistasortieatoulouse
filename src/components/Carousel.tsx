import React from 'react';
import { carouselImages, ImagePlaceholder } from '../lib/placeholder-images';

const FALLBACK_IMAGE = '/images/fallback.png';

const Carousel: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        overflowX: 'auto',
        gap: '16px',
        padding: '16px',
      }}
    >
      {carouselImages.map((image: ImagePlaceholder) => (
        <div
          key={image.id}
          style={{
            minWidth: '200px',
            flex: '0 0 auto',
            textAlign: 'center',
          }}
        >
          {image.imageUrl ? (
            <img
              src={image.imageUrl}
              alt={image.description}
              style={{
                width: '100%',
                height: '150px',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
              onError={(e) => {
                // Si l'image ne se charge pas, on met le fallback
                (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '150px',
                backgroundColor: '#ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
              }}
            >
              Image manquante
            </div>
          )}
          <p style={{ marginTop: '8px', fontSize: '14px' }}>
            {image.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Carousel;
