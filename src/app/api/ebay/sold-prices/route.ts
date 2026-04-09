import { NextRequest, NextResponse } from 'next/server';
import { fetchEbayPrices } from '@/lib/ebay';

export async function GET(request: NextRequest) {
  const cardName = request.nextUrl.searchParams.get('cardName');
  if (!cardName) {
    return NextResponse.json({ error: 'Missing cardName' }, { status: 400 });
  }

  const grade = request.nextUrl.searchParams.get('grade');
  const agency = request.nextUrl.searchParams.get('agency');

  try {
    const items = await fetchEbayPrices(cardName, {
      grade: grade ? Number(grade) : null,
      agency: agency || undefined,
    });

    return NextResponse.json({ items }, {
      headers: { 'Cache-Control': 'public, max-age=3600' },
    });
  } catch (error) {
    console.error('[eBay API Route]', error);
    return NextResponse.json({ error: 'Failed to fetch eBay data' }, { status: 500 });
  }
}
