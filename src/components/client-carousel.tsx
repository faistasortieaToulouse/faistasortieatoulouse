// src/components/client-carousel.tsx
'use client';

import { useState, useEffect } from 'react';
import placeholderImages from '@/lib/placeholder-images.json';
import { CarouselImage } from '@/types/types';
import { ImageCarousel } from './image-carousel';

export function ClientCarousel() {
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);

  useEffect(() => {
    // Convertit string[] en CarouselImage[] en respectant le type
    const imagesArray: CarouselImage[] = placeholderImages.carouselImages.map(
      (imageUrl: string, index: number) => ({
        id: index.toString(),             // id obligatoire
        imageUrl,                         // imageUrl obligatoire
        description: `Image ${index + 1}` // description obligatoire
      })
    );

    // Mélange et garde les 3 premières
    const shuffled = [...imagesArray].sort(() => 0.5 - Math.random());
    setCarouselImages(shuffled.slice(0, 3));
  }, []);

  if (carouselImages.length === 0) return null;

  // Passe CarouselImage[] à ImageCarousel
  return <ImageCarousel images={carouselImages} />;
}
