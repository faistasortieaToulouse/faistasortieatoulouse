'use client';

import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { carouselImages } from '@/lib/placeholder-images';
import { Card, CardContent } from './ui/card';

export function ImageCarousel() {
  return (
    <Carousel
      className="w-full max-w-4xl mx-auto"
      opts={{
        align: "start",
        loop: true,
      }}
    >
      <CarouselContent>
        {carouselImages.map((image) => (
          <CarouselItem key={image.id} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Card>
                {/* REMPLACER cette ligne dans image-carrousel.tsx */}
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
