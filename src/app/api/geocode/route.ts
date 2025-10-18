// src/app/api/geocode/route.ts
import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_MAPS_SERVER_KEY = process.env.GOOGLE_MAPS_SERVER_KEY;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address')?.trim();

  if (!address) {
    return NextResponse.json({
      status: 'ERROR',
      error_message: 'Adresse manquante',
      results: [],
    });
  }

  if (!GOOGLE_MAPS_SERVER_KEY) {
    return NextResponse.json({
      status: 'ERROR',
      error_message: 'Clé API Google Maps non définie',
      results: [],
    });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&components=country:FR&key=${GOOGLE_MAPS_SERVER_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'OK' || !data.results.length) {
      console.warn(`❌ Adresse introuvable : "${address}" (status: ${data.status})`);
      return NextResponse.json({
        status: data.status,
        error_message: data.error_message || 'Adresse introuvable',
        results: [],
      });
    }

    const location = data.results[0].geometry.location;
    const components = data.results[0].address_components;

    // Vérifie si l'adresse est en Haute-Garonne
    const inHauteGaronne = components.some(
      c => c.types.includes('administrative_area_level_2') && /Haute-Garonne/i.test(c.long_name)
    );

    if (!inHauteGaronne) {
      console.warn(`⚠️ Adresse hors Haute-Garonne ignorée : "${address}"`);
      return NextResponse.json({
        status: 'IGNORED',
        error_message: 'Adresse hors Haute-Garonne',
        results: [],
      });
    }

    console.log(`✅ Adresse géocodée : "${address}" → lat:${location.lat}, lng:${location.lng}`);

    return NextResponse.json({
      status: 'OK',
      results: [{ lat: location.lat, lng: location.lng }],
    });
  } catch (err: any) {
    console.error(`Erreur Geocoding API pour "${address}" :`, err);
    return NextResponse.json({
      status: 'ERROR',
      error_message: err.message || 'Erreur inconnue',
      results: [],
    });
  }
}
