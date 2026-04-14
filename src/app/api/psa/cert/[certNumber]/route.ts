import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchPsaCert, fetchPsaPopulation, type PsaCertResult } from '@/lib/psa-api';

const POP_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ certNumber: string }> }
) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: userData, error: userError } = await authClient.auth.getUser(authHeader.slice(7));
  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { certNumber } = await params;
  if (!/^\d+$/.test(certNumber)) {
    return NextResponse.json({ error: 'Invalid certNumber' }, { status: 400 });
  }

  const db = createAdminClient();

  const { data: certCache } = await db
    .from('psa_cert_cache')
    .select('spec_id, card_name, grade, my_grade_pop')
    .eq('cert_number', certNumber)
    .maybeSingle();

  let specId = certCache?.spec_id ?? null;
  let cardName = certCache?.card_name ?? null;
  let grade = certCache?.grade ?? null;
  let myGradePop = certCache?.my_grade_pop ?? 0;

  if (!certCache) {
    const cert = await fetchPsaCert(certNumber);
    if (!cert) {
      return NextResponse.json({ error: 'PSA cert not found' }, { status: 404 });
    }
    specId = cert.specId;
    cardName = cert.cardName;
    grade = cert.grade;
    myGradePop = cert.myGradePop;

    await db.from('psa_cert_cache').insert({
      cert_number: certNumber,
      spec_id: specId,
      card_name: cardName,
      grade,
      my_grade_pop: myGradePop,
    });
  }

  let gradeBreakdown: Record<string, number> = {};

  if (specId) {
    const { data: popCache } = await db
      .from('psa_pop_cache')
      .select('grade_breakdown, fetched_at')
      .eq('spec_id', specId)
      .maybeSingle();

    const isFresh =
      popCache && Date.now() - new Date(popCache.fetched_at).getTime() < POP_TTL_MS;

    if (isFresh) {
      gradeBreakdown = (popCache.grade_breakdown ?? {}) as Record<string, number>;
    } else {
      const pop = await fetchPsaPopulation(specId);
      if (pop) {
        gradeBreakdown = pop.gradeBreakdown;
        await db.from('psa_pop_cache').upsert({
          spec_id: specId,
          grade_breakdown: pop.gradeBreakdown,
          total_pop: pop.totalPop,
          fetched_at: new Date().toISOString(),
        });
      } else if (popCache) {
        gradeBreakdown = (popCache.grade_breakdown ?? {}) as Record<string, number>;
      }
    }
  }

  const body: PsaCertResult = {
    totalPop: myGradePop,
    gradeBreakdown,
    cardName,
    grade,
  };
  return NextResponse.json(body);
}
