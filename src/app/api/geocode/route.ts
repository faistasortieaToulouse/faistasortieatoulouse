import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_MAPS_SERVER_KEY = process.env.GOOGLE_MAPS_SERVER_KEY;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ status: 'ERROR', error_message: 'Adresse manquante', results: [] });
  }

  console.log('Adresse à géocoder :', address);

  if (!GOOGLE_MAPS_SERVER_KEY) {
    console.error('Clé serveur Google Maps manquante !');
    return NextResponse.json({ status: 'ERROR', error_message: 'Clé serveur manquante', results: [] });
  }

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_SERVER_KEY}`
    );

    if (!res.ok) {
      console.error('Erreur HTTP Geocoding API', res.status, res.statusText);
      return NextResponse.json({ status: 'ERROR', error_message: 'Erreur HTTP', results: [] });
    }

    const data = await res.json();

    console.log('Résultat Geocoding API :', JSON.stringify(data, null, 2));

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return NextResponse.json({
        status: 'OK',
        results: [{ lat: location.lat, lng: location.lng }]
      });
    }

    console.warn(`Adresse introuvable ou API échouée pour : "${address}"`, data.status);
    return NextResponse.json({ status: data.status, results: [] });
  } catch (err: any) {
    console.error('Exception Geocoding API :', err.message || err);
    return NextResponse.json({ status: 'ERROR', error_message: err.message || 'Unknown error', results: [] });
  }
}
