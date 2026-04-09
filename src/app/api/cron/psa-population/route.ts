import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchPsaCertData } from '@/lib/psa-api';

export async function GET(request: Request) {
  // Vercel Cronからの呼び出しを認証
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  // cert_numberを持つ全PSAカードを取得
  const { data: cards, error } = await supabase
    .from('cards')
    .select('id, cert_number')
    .eq('grading_agency', 'PSA')
    .not('cert_number', 'is', null);

  if (error || !cards || cards.length === 0) {
    return NextResponse.json({ message: 'No PSA cards found', count: 0 });
  }

  let successCount = 0;
  let errorCount = 0;

  // 5枚ずつ並列処理（PSA API負荷を考慮）
  const BATCH_SIZE = 5;
  for (let i = 0; i < cards.length; i += BATCH_SIZE) {
    const batch = cards.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async (card) => {
        const result = await fetchPsaCertData(card.cert_number);
        if (!result) throw new Error('No data');

        const { error: insertError } = await supabase
          .from('psa_population')
          .insert({
            card_id: card.id,
            total_pop: result.totalPop,
            grade_breakdown: result.gradeBreakdown,
          });

        if (insertError) throw new Error(insertError.message);
      })
    );

    for (const r of results) {
      if (r.status === 'fulfilled') successCount++;
      else errorCount++;
    }
  }

  return NextResponse.json({
    message: 'PSA population cron completed',
    total: cards.length,
    success: successCount,
    errors: errorCount,
  });
}
