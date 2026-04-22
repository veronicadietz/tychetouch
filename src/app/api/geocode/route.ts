import { NextRequest, NextResponse } from 'next/server';
import tzlookup from 'tz-lookup';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query || query.length < 3) {
    return NextResponse.json({ results: [] });
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=5&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'TycheTouch/1.0 (tychetouch.com)',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ results: [] });
    }

    const data = await response.json();
    const results = data.map((item: any) => {
      const lat = parseFloat(item.lat);
      const lon = parseFloat(item.lon);
      let timezone = 'UTC';
      try {
        timezone = tzlookup(lat, lon);
      } catch {
        // fallback
      }
      return {
        display: item.display_name,
        latitude: lat,
        longitude: lon,
        timezone,
      };
    });

    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json({ results: [], error: error.message });
  }
}
