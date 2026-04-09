'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Card, CardTitle, GradingAgency, CardStatus } from '@/types/database';

function throwSupabaseError(error: { message: string; code?: string; details?: string }): never {
  throw new Error(`${error.message} (code: ${error.code ?? '?'}, details: ${error.details ?? 'none'})`);
}

export async function getCards(): Promise<Card[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throwSupabaseError(error);
  return data as Card[];
}

export async function getCard(id: string): Promise<Card | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Card;
}

export async function createCard(formData: {
  title: CardTitle;
  name: string;
  image_url: string | null;
  back_image_url: string | null;
  purchase_price: number;
  purchase_shipping: number;
  grading_agency: GradingAgency;
  grade: number | null;
  grading_cost: number;
  estimated_price: number;
  sold_price: number | null;
  sold_at: string | null;
  platform_fee: number;
  quantity: number;
  status: CardStatus;
  memo: string | null;
  ebay_linked: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('認証が必要です');

  const { data: inserted, error } = await supabase.from('cards').insert({
    ...formData,
    user_id: user.id,
  }).select('id').single();

  if (error) throwSupabaseError(error);

  // 価格履歴を記録
  if (inserted && formData.estimated_price > 0) {
    await supabase.from('price_history').insert({
      card_id: inserted.id,
      price: formData.estimated_price,
    });
  }

  revalidatePath('/dashboard');
  revalidatePath('/portfolio');
}

export async function updateCard(
  id: string,
  formData: {
    title: CardTitle;
    name: string;
    display_name: string | null;
    image_url: string | null;
    back_image_url: string | null;
    purchase_price: number;
    purchase_shipping: number;
    grading_agency: GradingAgency;
    grade: number | null;
    grading_cost: number;
    cert_number: string | null;
    estimated_price: number;
    sold_price: number | null;
    sold_at: string | null;
    platform_fee: number;
    quantity: number;
    status: CardStatus;
    memo: string | null;
    ebay_linked: boolean;
  }
) {
  const supabase = await createClient();
  const { error } = await supabase.from('cards').update(formData).eq('id', id);

  if (error) throwSupabaseError(error);

  // 価格履歴を記録
  if (formData.estimated_price > 0) {
    await supabase.from('price_history').insert({
      card_id: id,
      price: formData.estimated_price,
    });
  }

  revalidatePath('/dashboard');
  revalidatePath('/portfolio');
  revalidatePath(`/portfolio/${id}`);
}

export async function updateCardImages(
  id: string,
  images: { image_url?: string | null; back_image_url?: string | null }
) {
  const supabase = await createClient();
  const { error } = await supabase.from('cards').update(images).eq('id', id);
  if (error) throwSupabaseError(error);

  revalidatePath(`/portfolio/${id}`);
}

export async function updateCardQuantity(id: string, delta: number) {
  const supabase = await createClient();

  const { data: card, error: fetchError } = await supabase
    .from('cards')
    .select('quantity')
    .eq('id', id)
    .single();

  if (fetchError || !card) throw new Error('カードが見つかりません');

  const newQuantity = Math.max(0, card.quantity + delta);

  if (newQuantity === 0) {
    const { error } = await supabase.from('cards').delete().eq('id', id);
    if (error) throwSupabaseError(error);
  } else {
    const { error } = await supabase
      .from('cards')
      .update({ quantity: newQuantity })
      .eq('id', id);
    if (error) throwSupabaseError(error);
  }

  revalidatePath('/dashboard');
  revalidatePath('/portfolio');
}

export async function deleteCard(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('cards').delete().eq('id', id);

  if (error) throwSupabaseError(error);

  revalidatePath('/dashboard');
  revalidatePath('/portfolio');
}

export async function getPriceHistory(cardId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('price_history')
    .select('price, recorded_at')
    .eq('card_id', cardId)
    .order('recorded_at', { ascending: true });

  if (error) return [];
  return data as { price: number; recorded_at: string }[];
}
