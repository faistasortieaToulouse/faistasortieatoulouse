'use client';

import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent } from './ui/card';
import { CarouselImage } from '@/types/types';
import React from 'react';

interface Props {
  images: string[]; // juste des URLs maintenant
}

export function ImageCarousel({ images }: Props) {
  if (!images || images.length === 0) return <p>Aucune image disponible</p>;

  // 🔹 Index de départ aléatoire pour le carrousel
  const startIndex = React.useMemo(() => {
    return Math.floor(Math.random() * images.length);
  }, [images]);

  return (
    <Carousel
      className="w-full max-w-4xl mx-auto"
      opts={{ align: 'start', loop: true, startIndex }} // <-- ici
    >
      <CarouselContent>
        {images.map((imgUrl, index) => (
          <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Card>
                <CardContent className="relative flex aspect-video md:aspect-[4/3] lg:aspect-[16/9] items-center justify-center p-0 overflow-hidden rounded-lg">
                  <Image
                    src={imgUrl}
                    alt={`Image ${index + 1}`} // alt simple basé sur l’index
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
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
