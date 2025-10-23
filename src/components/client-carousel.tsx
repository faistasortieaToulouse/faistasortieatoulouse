// src/components/client-carousel.tsx
'use client';

import { useState, useEffect } from 'react';
import placeholderImages from '@/lib/placeholder-images.json';
import { CarouselImage } from '@/types/types';
import { ImageCarousel } from './image-carousel';

export function ClientCarousel() {
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);

  useEffect(() => {
    // Convertit string[] en CarouselImage[]
    const imagesArray: CarouselImage[] = placeholderImages.carouselImages.map(
      (src: string, index: number) => ({
        src,
        alt: `Image ${index + 1}`, // Ajoute un alt simple
      })
    );

    // Shuffle et garde les 3 premières images
    const shuffled = [...imagesArray].sort(() => 0.5 - Math.random());
    setCarouselImages(shuffled.slice(0, 3));
  }, []);

  if (carouselImages.length === 0) return null;

  // Passe le tableau d'objets CarouselImage à ton ImageCarousel
  return <ImageCarousel images={carouselImages} />;
}
