'use client';

import { useState, useEffect } from 'react';
import placeholderImages from '@/lib/placeholder-images.json';
import { CarouselImage } from '@/types/types';
import { ImageCarousel } from './image-carousel';

export function ClientCarousel() {
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);

  useEffect(() => {
    // ✅ Inclut toutes les images, locales ou distantes
    const imagesArray: CarouselImage[] = placeholderImages.carouselImages.map(
      (imageUrl: string, index: number) => ({
        id: index.toString(),
        imageUrl,
        description: `Image ${index + 1}`,
      })
    );

    // Mélange et garde les 3 premières
    const shuffled = [...imagesArray].sort(() => 0.5 - Math.random());
    setCarouselImages(shuffled.slice(0, 3));
  }, []);

  if (carouselImages.length === 0) {
    return (
      <div className="h-40 w-full bg-gray-200 animate-pulse rounded-lg flex items-center justify-center text-gray-500">
        Chargement du carrousel...
      </div>
    );
  }

  // ✅ Passe correctement les images au carrousel
  return <ImageCarousel images={carouselImages} />;
}
