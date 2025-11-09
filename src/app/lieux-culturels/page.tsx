"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SectionProps {
  title: string;
  items: string[];
}

function Section({ title, items }: SectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-2xl mb-4 shadow-sm bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center w-full p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <h2 className="text-lg font-semibold">{title}</h2>
        {open ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      </button>
      {open && (
        <ul className="p-4 pt-0 space-y-1 text-gray-700">
          {items.map((item, i) => (
            <li key={i} className="border-b border-gray-100 last:border-none pb-1">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">
        🎭 Lieux Culturels à Toulouse
      </h1>

      <Section
        title="🎤 Stand-Up Comedy / Comedy Clubs"
        items={[
          "Capitole Comedy Club",
          "Totem Comedy Club",
          "Boudu Comedy – Ô Boudu Pont",
          "La Fabrique du Rire – Kalimera",
          "Fais-moi rire – The Petit London",
          "Vice Comedy – Bear’s House",
          "Prima Comedia – Prima Circus",
          "GOAT Comedy Club – Bar du Commerce Honoré",
          "VHS Comedy – Les 500",
          "Levrette Comedy Café",
          "Blague Buster – Little O’Clock",
          "Safe Comedy Show – Théâtre Roquelaine / Le Stimuli",
          "Stand-Up – Le Citron Bleu Café-théâtre",
          "Little Big Joke – Little Big Bar",
          "3 Brasseurs Comedy Club – Blagnac",
          "La Planque Comedy Club – Sesquières",
          "Pepouze Comedy Show – Buzet-sur-Tarn",
        ]}
      />

      <Section
        title="🎭 Improvisation Théâtrale"
        items={[
          "Les Ateliers d’Impro",
          "LUDI",
          "La Bulle Carrée",
          "L’Impro",
          "Lambda Impro",
          "Black Stories Impro",
          "Le Studio du Grand i Théâtre",
          "La Brique de Toulouse",
          "Les Grumots",
          "Festival Impulsez",
          "La Petite Scène",
        ]}
      />

      <Section
        title="🎟️ Théâtres"
        items={[
          "Théâtre du Capitole",
          "Théâtre de la Cité (TNT)",
          "Théâtre du Grand Rond",
          "Théâtre Garonne",
          "Théâtre du Pavé",
          "Théâtre du Fil à Plomb",
          "Théâtre Roquelaine",
          "La Comédie de Toulouse",
          "La Cave Poésie",
          "Café-théâtre Les 3T",
          "Café-théâtre Les Minimes",
          "Théâtre du Citron Bleu",
          "Théâtre du Pont-Neuf",
          "Théâtre du Chien Blanc",
          "Théâtre de la Violette",
        ]}
      />

      <Section
        title="🎶 Salles de Spectacle et Concerts"
        items={[
          "Halle aux Grains",
          "Zénith de Toulouse",
          "Casino Barrière",
          "Metronum",
          "Le Bijou",
          "Le Mandala",
          "La Grainerie",
          "Le Lido",
          "Le 111 Lunares",
          "Le Cap",
          "La Cabane",
          "Odyssud (Blagnac)",
          "Altigone (Saint-Orens)",
          "Le Bikini (Ramonville)",
          "Le Bascala (Bruguières)",
          "Le Phare / L’Escale (Tournefeuille)",
        ]}
      />

      <Section
        title="🎬 Cinémas d’Art et d’Essai"
        items={[
          "Cinéma ABC",
          "L’American Cosmograph",
          "Cinémathèque de Toulouse",
          "Le Cratère",
          "Le Métro",
        ]}
      />

      <Section
        title="🎧 Blind Tests & Quiz Musicaux"
        items={[
          "Thirsty Monk Quiz Night",
          "George & Dragon Pub",
          "Blind Test Sauvage – BlackShepherd",
          "Super Blind Test – Le Champagne",
          "Ô Boudu Pont",
          "Pub O’Clock / Four Monkeys / The Danu",
          "Tower of London / London Town",
          "Le Filochard",
          "Delicatessen",
          "Little O’Clock",
          "La Biérothèque",
          "Beers & Bretzels",
          "La Planque",
          "Chez Jacques",
          "Le Rhino",
        ]}
      />

      <Section
        title="🎤 Karaoké"
        items={[
          "L’Écran Pop – Pathé Wilson",
          "Le Karioka – Karaoké Box & Bar",
          "L’Autruche",
          "The George & Dragon",
          "Le Dauphin",
          "Le Chorus",
          "You Sing Toulouse Montaudran",
          "Ô Boudu Pont",
          "La Maison",
          "Le Saint des Seins",
          "La Bièrothèque Gramont",
          "La Friche Gourmande",
          "Le Rhino",
          "Tower of London",
          "Chez Jacques",
          "Restaurant La Grange",
        ]}
      />
    </div>
  );
}
