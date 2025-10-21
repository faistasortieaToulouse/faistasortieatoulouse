// src/app/contact/page.tsx
// AUCUN 'use client' ici.
// AUCUN hook React (useState, useEffect, useForm, useToast) n'est importé ou utilisé ici.

import ContactFormClient from '@/components/ContactFormClient';
import MainLayout from "@/app/(main)/layout"; 

export default function ContactPage() {
    return (
        <MainLayout> 
            <div className="flex flex-col items-center pt-8 pb-12 w-full max-w-lg mx-auto">
                {/* 👈 L'appel au Client Component encapsule toute la logique */}
                <ContactFormClient /> 
            </div>
        </MainLayout>
    );
}

// ... (reste du code)

  // --- Lier le widget ALTCHA et détecter le mobile ---
useEffect(() => {
  // Détection de la taille de l'écran (ex: max-width 768px pour mobile/tablette)
  const isMobileScreen = window.matchMedia('(max-width: 768px)').matches;
  
  // ✅ AJOUT : Définir l'URL du challenge en fonction du mobile
  if (isMobileScreen) {
      setChallengeUrl('/api/altcha?mobile=true');
      console.log('📱 Mobile détecté : Utilisation de challengeurl=/api/altcha?mobile=true');
  } else {
      setChallengeUrl('/api/altcha');
  }

  if (!document.querySelector('script[data-altcha-loaded]')) {
// ... (code de chargement du script inchangé)
// ...
  } else {
    console.log('✅ ALTCHA.js déjà chargé');
    setScriptLoaded(true);
  }
}, []);


  // ... (code de resetAltcha et onSubmit inchangé)

  return (
    <div className="flex flex-col items-center pt-8 pb-12 w-full max-w-lg mx-auto">
      <Card className="w-full">
        {/* ... (CardHeader inchangée) ... */}
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* ... (Champs name, email, subject, message inchangés) ... */}
              
              {/* Champ caché pour la valeur ALTCHA */}
              <input type="hidden" {...form.register('altcha')} />

              <div className="flex flex-col items-center pt-2">
                <altcha-widget
                  name="altcha"
                  theme="auto"
                  auto="onsubmit"
                  // ✅ MODIFICATION : Utilisation de l'état challengeUrl
                  challengeurl="/api/altcha" // ✅ OK
                  style={{ width: '100%', maxWidth: 320 }}
                />
                {/* ... (Affichage altchaError inchangé) ... */}
              </div>

              {/* ... (Bouton de soumission inchangé) ... */}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
