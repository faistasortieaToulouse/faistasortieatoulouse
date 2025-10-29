import React, { useMemo } from 'react';
// Retire l'import d'Image si vous n'utilisez que la balise <img>
// import Image from "next/image"; 
// S'assurer que le type est importé une seule fois
import { ImagePlaceholder } from '../lib/placeholder-images'; 
// Retire l'import des données brutes, elles doivent venir des props
// import { carouselImages } from '../lib/placeholder-images'; 

const FALLBACK_IMAGE = '/images/fallback.png';

// 1. DÉFINITION DE L'INTERFACE DE PROPS
interface CarouselProps {
    images: ImagePlaceholder[];      // Les images d'activités
    logoUrl: string | undefined;     // L'URL du logo (peut être undefined)
}

// 2. LE COMPOSANT ACCEPTE LES PROPS
const Carousel: React.FC<CarouselProps> = ({ images, logoUrl }) => {

    // 3. LOGIQUE POUR CRÉER L'OBJET LOGO À PARTIR DE LA PROP (à l'intérieur du composant)
    const logoImage: ImagePlaceholder | undefined = useMemo(() => {
        if (!logoUrl) return undefined;
        return {
            id: 'fts-logo',
            imageUrl: logoUrl,
            description: 'Logo FTS',
            imageHint: 'logo'
        };
    }, [logoUrl]);

    // Sélectionne le logo + 3 images aléatoires
    const displayImages = useMemo(() => {
        // La recherche de logo est retirée, on utilise l'objet créé au-dessus.
        
        // Les autres images sont les props 'images' (les activités)
        const otherImages = images;
        
        const needed = Math.min(3, otherImages.length);
        const shuffled = otherImages.sort(() => 0.5 - Math.random()).slice(0, needed);
        
        // Ajoute le logo si disponible
        return logoImage ? [logoImage, ...shuffled] : shuffled;
        
    }, [images, logoImage]); // Dépendances corrigées
    
    return (
        <div
            style={{
                display: 'flex',
                gap: '12px',
                padding: '12px',
                overflowX: 'auto',
                scrollbarWidth: 'none', // cache scrollbar Firefox
            }}
        >
            {displayImages.map((image: ImagePlaceholder) => (
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
                        alt={image.description || 'LogoFTS'}
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
