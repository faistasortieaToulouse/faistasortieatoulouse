// src/app/(main)/page.tsx

// ... (Imports inchangés) ...

export const revalidate = 300; // Revalidate at most every 5 minutes

const GUILD_ID = '1422806103267344416';
const ftsLogoUrlPurple = "https://firebasestorage.googleapis.com/v0/b/tolosaamicalstudio.firebasestorage.app/o/faistasortieatoulouse%2FlogoFTS650bas.jpg?alt=media&token=a8b14c5e-5663-4754-a2fa-149f9636909c"; 

// ... (Interfaces inchangées : DiscordChannel, DiscordEvent, DiscordWidgetData, WeatherData) ...

export default async function DashboardPage() {
    
    // =================================================================
    // DÉCLARATIONS ET LOGIQUE DATE/MÉTÉO (CORRIGÉES PRÉCÉDEMMENT)
    // =================================================================
    const now = new Date();
    // ... (Logique dateFormatter et timeFormatter) ...
    const currentDate = dateFormatter.format(now);
    const currentTime = timeFormatter.format(now);

    // ... (Logique météo : weatherUrl, weatherData, weatherDisplay, WeatherIcon) ...
    
    // (J'ai retiré le corps de cette section pour ne pas répéter tout le code météo,
    // mais elle doit être présente et correcte ici)
    // ... (Début du try/catch météo ici) ...
    // ... (Fin du try/catch météo ici) ...


    // =================================================================
    // LOGIQUE DISCORD : Récupération des données
    // =================================================================
    const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN; 
    
    if (!DISCORD_TOKEN) {
        console.warn("DISCORD_BOT_TOKEN est manquant. Seules les données publiques (Widget API) seront disponibles.");
    }
    
    // 1. Récupération des salons (Channels)
    const channelsData: DiscordChannel[] = DISCORD_TOKEN ? await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/channels`, {
        headers: {
            Authorization: `Bot ${DISCORD_TOKEN}`, 
        },
        next: { revalidate: 300 } 
    })
    .then(async res => {
        if (!res.ok) {
            console.error(`Failed to fetch Discord channels: ${res.status} ${res.statusText}`);
            return []; 
        }
        return res.json();
    })
    .catch(err => {
        console.error('Error fetching Discord channels:', err);
        return []; 
    }) : []; 

    
    // 2. Récupération des événements (Events)
    const eventsData: DiscordEvent[] = DISCORD_TOKEN ? await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/scheduled-events`, {
        headers: {
            Authorization: `Bot ${DISCORD_TOKEN}`, 
        },
        next: { revalidate: 300 } 
    })
    .then(async res => {
        if (!res.ok) {
            console.error(`Failed to fetch Discord events: ${res.status} ${res.statusText}`);
            return [];
        }
        return res.json();
    })
    .catch(err => {
        console.error('Error fetching Discord events:', err);
        return [];
    }) : [];
    
    
    // 3. Récupération du Widget Public (pour les membres/statistiques)
    const widgetData: { presence_count: number; members: any[]; } = await fetch(`https://discord.com/api/guilds/${GUILD_ID}/widget.json`, { 
        next: { revalidate: 300 } 
    })
    .then(res => res.json())
    .catch(() => ({ presence_count: 0, members: [] }));

    
    // 4. Construction de l'objet principal DiscordData
    const discordData: DiscordWidgetData = {
        id: GUILD_ID,
        name: 'Fais ta Sortie',
        instant_invite: `https://discord.gg/votre-invite`, // À remplacer par l'invite réelle
        channels: channelsData,
        members: widgetData.members,
        presence_count: widgetData.presence_count,
        events: eventsData,
    };

    // 5. Calcul des événements à venir
    const oneWeekFromNow = now.getTime() + (7 * 24 * 60 * 60 * 1000);
    
    const upcomingEventsCount = eventsData.filter(event => {
        const startTime = new Date(event.scheduled_start_time).getTime();
        return startTime >= now.getTime() && startTime <= oneWeekFromNow;
    }).length;


    // =================================================================
    // DÉBUT DU RENDU JSX
    // =================================================================

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8"> 
            
            {/* ... (Bloc LOGO FTS inchangé) ... */}
            
            {/* ... (Bloc BARRE DE STATUT inchangé) ... */}

            {/* ... (Bloc HEADER inchangé, sans SidebarTrigger) ... */}
            <header className="flex flex-col gap-4">
                {/* LIGNE DU TITRE */}
                <div className="flex justify-between items-center w-full">
                    <h1 className="font-headline text-4xl font-bold text-primary">Tableau de Bord</h1>
                </div>

                {/* Descriptions (Sous le titre) */}
                <p className="mt-2 text-accent">
                    Application pour faire des sorties à Toulouse : discute des sorties, échange et organise.
                </p>
                <p className="mt-2 text-accent">
                    tout est gratuit et sans limite !
                </p>
            </header>

            {/* SECTION DU CARROUSEL : AJOUT DES CLASSES RESPONSIVES */}
            <section className="flex justify-center w-full"> 
                <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl mx-auto">
                    <ImageCarousel />
                </div>
            </section>
            
            {/* ... (Sections boutons inchangées) ... */}
            
            <section className="flex flex-wrap justify-center items-center gap-4">
                <Button asChild size="lg">
                    <Link href={`https://discord.com/channels/${GUILD_ID}/1422806103904882842`} target="_blank" rel="noopener noreferrer">
                        Pour commencer, clique ici :
                    </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                    <Link href="https://discord.com/download" target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-5 w-5" />
                        Télécharger Discord
                    </Link>
                </Button>
            </section>

            <section className="flex flex-wrap justify-center gap-4">
                <Button size="lg" variant="outline" disabled>
                    <PartyPopper className="mr-2 h-5 w-5" />
                    Girls Party
                </Button>
                <Button size="lg" variant="outline" disabled>
                    <PartyPopper className="mr-2 h-5 w-5" />
                    Student Event
                </Button>
            </section>

            <section>
                {/* Utilise discordData */}
                <DiscordStats data={discordData} />
            </section>
            
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex flex-col gap-8">
                    {/* Utilise discordData?.events */}
                    <AiRecommendations eventData={discordData?.events ? JSON.stringify(discordData.events, null, 2) : 'No event data available.'} />
                    <DiscordWidget />
                    {/* Utilise discordData?.channels */}
                    <DiscordChannelList channels={discordData?.channels} />
                </div>
                <div className="flex flex-col gap-8">
                    {/* Utilise discordData?.events */}
                    <DiscordEvents events={discordData?.events} />
                </div>
            </section>

            <section>
                <Alert>
                    <BellRing className="h-4 w-4" />
                    <AlertTitle>Événements à Venir (7 Jours)</AlertTitle>
                    <AlertDescription>
                        {/* Utilise upcomingEventsCount */}
                        {upcomingEventsCount > 0 ? (
                            <p className="font-bold text-lg text-primary">
                                Il y a actuellement **{upcomingEventsCount}** événements prévus cette semaine !
                            </p>
                        ) : (
                            'Aucun événement n’est prévu cette semaine. Consultez la liste ci-dessous pour organiser une sortie !'
                        )}
                    </AlertDescription>
                </Alert>
            </section>
        </div>
    );
}
