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

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&components=country:FR&key=${GOOGLE_MAPS_SERVER_KEY}`;

    console.log(`Géocodage : "${address}" → ${url}`);

    const res = await fetch(url);
    const data = await res.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];

      // Vérifie si l'adresse est en Haute-Garonne
      const inHauteGaronne = result.address_components.some(comp =>
        comp.types.includes('administrative_area_level_2') &&
        comp.long_name.toLowerCase() === 'haute-garonne'
      );

      if (!inHauteGaronne) {
        console.warn(`⚠️ Adresse hors Haute-Garonne ignorée : "${address}"`);
        return NextResponse.json({
          status: 'IGNORED',
          error_message: 'Adresse hors Haute-Garonne',
          results: [],
        });
      }

      const location = result.geometry.location;
      console.log(`✅ Adresse géocodée : "${address}" → lat:${location.lat}, lng:${location.lng}`);
      return NextResponse.json({
        status: 'OK',
        results: [{ lat: location.lat, lng: location.lng }],
      });
    } else {
      console.warn(`❌ Adresse introuvable : "${address}" (status: ${data.status})`);
      return NextResponse.json({
        status: data.status,
        error_message: data.error_message || 'Adresse introuvable',
        results: [],
      });
    }
  } catch (err: any) {
    console.error(`Erreur Geocoding API pour "${address}" :`, err);
    return NextResponse.json({
      status: 'ERROR',
      error_message: err.message || 'Erreur inconnue',
      results: [],
    });
  }
}
