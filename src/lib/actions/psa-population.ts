'use server';

import { createClient } from '@/lib/supabase/server';
import { fetchPsaCertData } from '@/lib/psa-api';
import { revalidatePath } from 'next/cache';
import type { PsaPopulation } from '@/types/database';

export async function getPsaPopHistory(cardId: string): Promise<PsaPopulation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('psa_population')
    .select('*')
    .eq('card_id', cardId)
    .order('fetched_at', { ascending: true });

  if (error) {
    console.error('[PSA Pop] Failed to fetch history:', error.message);
    return [];
  }
  return data as PsaPopulation[];
}

const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function fetchAndStorePsaPop(cardId: string): Promise<PsaPopulation | null> {
  const supabase = await createClient();

  // カード情報を取得（cert_number確認 + 認証チェック）
  const { data: card, error: cardError } = await supabase
    .from('cards')
    .select('id, cert_number, grading_agency')
    .eq('id', cardId)
    .single();

  if (cardError || !card || !card.cert_number || card.grading_agency !== 'PSA') {
    return null;
  }

  // 最新のスナップショットが24h以内ならスキップ
  const { data: latest } = await supabase
    .from('psa_population')
    .select('fetched_at')
    .eq('card_id', cardId)
    .order('fetched_at', { ascending: false })
    .limit(1)
    .single();

  if (latest) {
    const lastFetched = new Date(latest.fetched_at).getTime();
    if (Date.now() - lastFetched < STALE_THRESHOLD_MS) {
      return null;
    }
  }

  // PSA APIからデータ取得
  const result = await fetchPsaCertData(card.cert_number);
  if (!result) return null;

  // DBに保存
  const { data: inserted, error: insertError } = await supabase
    .from('psa_population')
    .insert({
      card_id: cardId,
      total_pop: result.totalPop,
      grade_breakdown: result.gradeBreakdown,
    })
    .select('*')
    .single();

  if (insertError) {
    console.error('[PSA Pop] Insert failed:', insertError.message);
    return null;
  }

  revalidatePath(`/portfolio/${cardId}`);
  return inserted as PsaPopulation;
}
