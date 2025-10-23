import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// --- placeholderImages ---
export const placeholderImages: ImagePlaceholder[] = Array.isArray(data.placeholderImages)
  ? data.placeholderImages.map((item, index) => {
      // On force item comme Partial<ImagePlaceholder> pour TypeScript
      const obj = item as Partial<ImagePlaceholder>;
      return {
        id: obj.id ?? String(index),
        description: obj.description ?? `Placeholder image ${index + 1}`,
        imageUrl: obj.imageUrl ?? '',
        imageHint: obj.imageHint ?? '',
      };
    })
  : [];

// --- carouselImages ---
export const carouselImages: ImagePlaceholder[] = Array.isArray(data.carouselImages)
  ? data.carouselImages.map((item, index) => {
      if (typeof item === 'string') {
        return {
          id: String(index),
          description: `Carousel image ${index + 1}`,
          imageUrl: item,
          imageHint: `Image ${index + 1}`,
        };
      } else if (typeof item === 'object' && item !== null) {
        const obj = item as Partial<ImagePlaceholder>;
        return {
          id: obj.id ?? String(index),
          description: obj.description ?? `Carousel image ${index + 1}`,
          imageUrl: obj.imageUrl ?? '',
          imageHint: obj.imageHint ?? '',
        };
      } else {
        // fallback sécurisé si le JSON contient une valeur inattendue
        return {
          id: String(index),
          description: `Carousel image ${index + 1}`,
          imageUrl: '',
          imageHint: `Image ${index + 1}`,
        };
      }
    })
  : [];
