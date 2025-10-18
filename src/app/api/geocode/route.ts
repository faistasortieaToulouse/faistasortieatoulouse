// /src/app/api/geocoderoute/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address');
  if (!address) return NextResponse.json({ status: 'ERROR', results: [] });

  const key = process.env.GOOGLE_MAPS_SERVER_KEY;
  if (!key) return NextResponse.json({ status: 'ERROR', results: [] });

  try {
    const geoRes = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`
    );
    const data = await geoRes.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Erreur API géocodage:', err);
    return NextResponse.json({ status: 'ERROR', results: [] });
  }
}
