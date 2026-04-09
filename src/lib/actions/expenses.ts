'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Expense, ExpenseCategory } from '@/types/database';

export async function getExpenses(): Promise<Expense[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  return data as Expense[];
}

export async function createExpense(formData: {
  category: ExpenseCategory;
  amount: number;
  description: string | null;
  date: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('認証が必要です');

  const { error } = await supabase.from('expenses').insert({
    ...formData,
    user_id: user.id,
  });

  if (error) throw error;

  revalidatePath('/expenses');
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('expenses').delete().eq('id', id);

  if (error) throw error;

  revalidatePath('/expenses');
}
