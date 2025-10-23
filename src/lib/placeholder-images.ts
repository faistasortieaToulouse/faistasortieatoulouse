import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// --- placeholderImages ---
// On suppose que data.placeholderImages est déjà conforme à ImagePlaceholder[]
export const placeholderImages: ImagePlaceholder[] = Array.isArray(data.placeholderImages)
  ? data.placeholderImages.map((item, index) => ({
      id: item.id ?? String(index),
      description: item.description ?? `Placeholder image ${index + 1}`,
      imageUrl: item.imageUrl ?? '',
      imageHint: item.imageHint ?? '',
    }))
  : [];

// --- carouselImages ---
// Si data.carouselImages est un tableau de strings, on le convertit en ImagePlaceholder[]
export const carouselImages: ImagePlaceholder[] = Array.isArray(data.carouselImages)
  ? data.carouselImages.map((item, index) => {
      if (typeof item === 'string') {
        return {
          id: String(index),
          description: `Carousel image ${index + 1}`,
          imageUrl: item,
          imageHint: `Image ${index + 1}`,
        };
      }
      // Sinon, si c’est déjà un objet conforme à ImagePlaceholder, on normalise juste les valeurs
      return {
        id: item.id ?? String(index),
        description: item.description ?? `Carousel image ${index + 1}`,
        imageUrl: item.imageUrl ?? '',
        imageHint: item.imageHint ?? '',
      };
    })
  : [];
