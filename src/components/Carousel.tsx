import React, { useMemo } from 'react';
// Retire l'import d'Image si vous n'utilisez que la balise <img>
// import Image from "next/image"; 
import { CarouselImage } from '@/types/types'; // Importez le type CarouselImage

const FALLBACK_IMAGE = '/images/fallback.png';

// 1. DÉFINITION DE L'INTERFACE DE PROPS
interface CarouselProps {
    images: CarouselImage[]; // Les images d'activités
}

// 2. LE COMPOSANT ACCEPTE LES PROPS
const Carousel: React.FC<CarouselProps> = ({ images }) => {

    // Sélectionne 3 images aléatoires parmi les props
    const displayImages = useMemo(() => {
        const needed = Math.min(3, images.length);
        return images.sort(() => 0.5 - Math.random()).slice(0, needed);
    }, [images]); // Dépendances corrigées

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                overflowX: 'auto',
                scrollbarWidth: 'none', // cache scrollbar Firefox
            }}
        >
            {displayImages.map((image: CarouselImage) => (
                <div
                    key={image.id}
                    style={{
                        flex: '0 0 auto',
                        minWidth: '120px',
                        maxWidth: '300px',
                        width: 'calc(33.33% - 16px)',
                        textAlign: 'center',
                    }}
                >
                    <img
                        src={image.imageUrl || FALLBACK_IMAGE}
                        alt={image.description || 'Image'}
                        width={300}
                        height={200}
                        style={{
                            width: '100%',
                            height: 'auto',
                            objectFit: 'cover',
                            borderRadius: '8px',
                        }}
                        onError={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            if (!img.src.includes(FALLBACK_IMAGE)) {
                                img.src = FALLBACK_IMAGE;
                            }
                        }}
                    />
                </div>
            ))}
        </div>
    );
};

export default Carousel;
