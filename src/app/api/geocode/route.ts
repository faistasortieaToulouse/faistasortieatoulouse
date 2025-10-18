// 'use server' si nécessaire
import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_MAPS_SERVER_KEY = process.env.GOOGLE_MAPS_SERVER_KEY;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ status: 'ERROR', error_message: 'Adresse manquante', results: [] });
  }

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_SERVER_KEY}`
    );
    const data = await res.json();
    
    // Vérifie si la réponse est OK et contient au moins un résultat
    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return NextResponse.json({
        status: 'OK',
        results: [{ lat: location.lat, lng: location.lng }]
      });
    }

    return NextResponse.json({ status: data.status, results: [] });
  } catch (err) {
    console.error('Erreur Geocoding API:', err);
    return NextResponse.json({ status: 'ERROR', error_message: err.message, results: [] });
  }
}
