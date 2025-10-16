import MainLayout from "@/app/(main)/layout";
import { ReactNode } from "react";
import Script from "next/script"; // <-- NOUVEL IMPORT

export default function Layout({ children }: { children: ReactNode }) {
    return (
        // Le MainLayout retourne probablement l'élément <body>.
        // C'est pourquoi nous plaçons le Script juste après le MainLayout, 
        // pour qu'il se charge après le contenu principal (stratégie "afterInteractive").
        <>
            <MainLayout>{children}</MainLayout>
            
            {/* --- AJOUT DU SCRIPT CLOUDFLARE TURNSTILE --- */}
            <Script 
                src="https://challenges.cloudflare.com/turnstile/v0/api.js" 
                strategy="afterInteractive" // Charge le script après le rendu du contenu
                async // Maintient l'attribut async
                defer // Maintient l'attribut defer
            />
            {/* ------------------------------------------ */}
        </>
    )
}
