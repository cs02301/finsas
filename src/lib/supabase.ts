import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Account, Category, Transaction, Budget } from '../types';

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let supabase: SupabaseClient | null = null;
if (URL && KEY) {
  supabase = createClient(URL, KEY);
}

export const isSupabaseConfigured = (): boolean => !!supabase;

export const upsertAccounts = async (accounts: Account[]) => {
  if (!supabase || accounts.length === 0) return;
  // map to snake_case expected in DB
  const payload = accounts.map(a => ({ ...a, user_id: a.userId }));
  await supabase.from('accounts').upsert(payload);
};

export const upsertCategories = async (categories: Category[]) => {
  if (!supabase || categories.length === 0) return;
  const payload = categories.map(c => ({ ...c, user_id: c.userId }));
  await supabase.from('categories').upsert(payload);
};

export const upsertTransactions = async (transactions: Transaction[]) => {
  if (!supabase || transactions.length === 0) return;
  const payload = transactions.map(t => ({ ...t, user_id: t.userId }));
  await supabase.from('transactions').upsert(payload);
};

export const upsertBudgets = async (budgets: Budget[]) => {
  if (!supabase || budgets.length === 0) return;
  const payload = budgets.map(b => ({ ...b, user_id: b.userId }));
  await supabase.from('budgets').upsert(payload);
};

export const fetchAllForUser = async (userId: string) => {
  if (!supabase) return { accounts: [], categories: [], transactions: [], budgets: [] };

  const [{ data: accounts }, { data: categories }, { data: transactions }, { data: budgets }] = await Promise.all([
    supabase.from('accounts').select('*').eq('user_id', userId),
    supabase.from('categories').select('*').eq('user_id', userId),
    supabase.from('transactions').select('*').eq('user_id', userId),
    supabase.from('budgets').select('*').eq('user_id', userId),
  ]);

  // map snake_case back to camelCase keys where relevant
  const mapAccounts = (accounts || []).map((a: any) => ({ ...a, userId: a.user_id }));
  const mapCategories = (categories || []).map((c: any) => ({ ...c, userId: c.user_id }));
  const mapTransactions = (transactions || []).map((t: any) => ({ ...t, userId: t.user_id }));
  const mapBudgets = (budgets || []).map((b: any) => ({ ...b, userId: b.user_id }));

  return { accounts: mapAccounts, categories: mapCategories, transactions: mapTransactions, budgets: mapBudgets };
};
