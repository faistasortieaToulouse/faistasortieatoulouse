'use client';

import { useState, useEffect } from 'react';
import placeholderImages from '@/lib/placeholder-images.json';
import { CarouselImage } from '@/types/types';
import { ImageCarousel } from './image-carousel';

export function ClientCarousel() {
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);

useEffect(() => {
  const imagesArray: CarouselImage[] = placeholderImages.carouselImages
    .filter((url: string) => typeof url === 'string' && url.startsWith('http'))
    .map((imageUrl: string, index: number) => ({
      id: index.toString(),
      imageUrl,
      description: `Image ${index + 1}`
    }));

    // Mélange et garde les 3 premières
    const shuffled = [...imagesArray].sort(() => 0.5 - Math.random());
    setCarouselImages(shuffled.slice(0, 3));
  }, []);

if (carouselImages.length === 0) {
    // 💡 Affichez un squelette ou un message de chargement
    return <div className="h-40 w-full bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
        Chargement du carrousel...
    </div>; 
  }

  // Passe CarouselImage[] à ImageCarousel
  return <ImageCarousel images={carouselImages} />;
}
