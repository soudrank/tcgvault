import { NextRequest, NextResponse } from 'next/server';
import { fetchEbayPrices } from '@/lib/ebay';
import { fetchEbaySoldPrices } from '@/lib/apify-ebay';

export async function GET(request: NextRequest) {
  const cardName = request.nextUrl.searchParams.get('cardName');
  if (!cardName) {
    return NextResponse.json({ error: 'Missing cardName' }, { status: 400 });
  }

  const source = request.nextUrl.searchParams.get('source');
  const grade = request.nextUrl.searchParams.get('grade');
  const agency = request.nextUrl.searchParams.get('agency');

  try {
    if (source === 'apify') {
      // Apify: eBay落札価格
      let query = cardName;
      if (agency && agency !== 'none') query += ` ${agency}`;
      if (grade) query += ` ${grade}`;

      const items = await fetchEbaySoldPrices(query);
      return NextResponse.json({ items }, {
        headers: { 'Cache-Control': 'public, max-age=86400' }, // 24h キャッシュ
      });
    }

    // デフォルト: Browse API（出品価格）
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
