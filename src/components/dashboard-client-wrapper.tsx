"use client";

import React, { useMemo } from 'react';
import { TimeWeatherBar } from './time-weather-bar';
import { ImageCarousel } from './image-carousel';
import { CarouselImage } from '@/types/types';

interface Props {
  placeholderImages: CarouselImage[];
}

export function DashboardClientWrapper({ placeholderImages }: Props) {
  // Tirage aléatoire côté client pour éviter l'hydration error
  const carouselImages = useMemo(() => {
    const shuffled = [...placeholderImages].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [placeholderImages]);

  return (
    <>
      <TimeWeatherBar />
      <section>
        <ImageCarousel images={carouselImages} />
      </section>
    </>
  );
}
