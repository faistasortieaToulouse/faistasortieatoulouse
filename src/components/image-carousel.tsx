'use client';

import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { carouselImages } from '@/lib/placeholder-images';
import { Card, CardContent } from './ui/card';

// Fonction de mélange aléatoire (Fisher-Yates shuffle)
function shuffleArray(array: any[]) {
  // Crée une copie du tableau pour ne pas modifier l'original (carouselImages)
  let newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function ImageCarousel() {
  // Mélange les images à chaque rendu du composant
  const shuffledImages = shuffleArray(carouselImages);
  
  // Vous pouvez ajuster le nombre d'images affichées si nécessaire.
  // Ici, nous prenons toutes les images mélangées.
  const imagesToDisplay = shuffledImages; 

  return (
    <Carousel
      className="w-full max-w-4xl mx-auto"
      opts={{
        align: "start",
        loop: true,
      }}
    >
      <CarouselContent>
        {/* On mappe sur la liste mélangée */}
        {imagesToDisplay.map((image) => (
          <CarouselItem key={image.id} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Card>
                <CardContent className="relative flex aspect-video md:aspect-[4/3] lg:aspect-[16/9] items-center justify-center p-0 overflow-hidden rounded-lg">
                  <Image
                    src={image.imageUrl}
                    alt={image.description}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                    data-ai-hint={image.imageHint}
                  />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex" />
      <CarouselNext className="hidden sm:flex" />
    </Carousel>
  );
}
