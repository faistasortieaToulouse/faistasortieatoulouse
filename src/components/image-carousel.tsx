// src/components/image-carousel.tsx
'use client';

import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent } from './ui/card';
import { CarouselImage } from '@/types/types';
import React from 'react';

interface Props {
  images: CarouselImage[];
}

export function ImageCarousel({ images }: Props) {
  if (!images || images.length === 0) return <p>Aucune image disponible</p>;

  const startIndex = React.useMemo(() => Math.floor(Math.random() * images.length), [images]);

  return (
    <Carousel
      className="w-full max-w-4xl mx-auto"
      opts={{ align: 'start', loop: true, startIndex }}
    >
      <CarouselContent>
        {images.map((img) => (
          <CarouselItem key={img.id} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Card>
                <CardContent className="relative flex aspect-video md:aspect-[4/3] lg:aspect-[16/9] items-center justify-center p-0 overflow-hidden rounded-lg">
                  <CarouselImageWithFallback src={img.imageUrl} alt={img.description || 'carousel image'} />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="flex" />
      <CarouselNext className="flex" />
    </Carousel>
  );
}

/** Composant local : Next/Image avec fallback <img> en cas d'erreur */
function CarouselImageWithFallback({ src, alt }: { src: string; alt: string }) {
  const [errored, setErrored] = React.useState(false);
  const [key, setKey] = React.useState(0); // pour forcer rerender si nécessaire

  // Si Next/Image échoue, on bascule sur <img>
  if (errored) {
    return (
      // fallback simple : <img> non optimisée
      <img
        key={key}
        src={src}
        alt={alt}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={() => {
          // en cas d'erreur aussi sur fallback, affiche image placeholder locale
          setKey((k) => k + 1);
        }}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      style={{ objectFit: 'cover' }}
      onError={() => {
        setErrored(true);
      }}
      // Si tu veux désactiver l'optimisation Next.js (pour debug ou pb d'optimisation) :
      // unoptimized
    />
  );
}
