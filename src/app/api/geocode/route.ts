// D:\faistasortietest2\src\app\api\geocoderoute.js
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json({ error: "Missing address" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_SERVER_KEY; // clé serveur, non exposée

    if (!apiKey) {
      return NextResponse.json({ error: "Server API key not set" }, { status: 500 });
    }

    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    );

    if (!res.ok) {
      return NextResponse.json({ error: `Google Geocode API error: ${res.status}` }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Erreur dans geocoderoute:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
