import { User, Account, Category, Transaction, Budget } from '../types';
import { isSupabaseConfigured, upsertAccounts, upsertCategories, upsertTransactions, upsertBudgets, fetchAllForUser } from '../lib/supabase';

const STORAGE_KEYS = {
  USER: 'finance_user',
  TOKEN: 'finance_token',
  ACCOUNTS: 'finance_accounts',
  CATEGORIES: 'finance_categories',
  TRANSACTIONS: 'finance_transactions',
  BUDGETS: 'finance_budgets',
  THEME: 'finance_theme',
} as const;

export const storage = {
  // User & Auth
  getUser: (): User | null => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },
  
  setUser: (user: User): void => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  
  getToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },
  
  setToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },
  
  // Data
  getAccounts: (userId: string): Account[] => {
    const accounts = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    const allAccounts = accounts ? JSON.parse(accounts) : [];
    return allAccounts.filter((account: Account) => account.userId === userId);
  },
  
  setAccounts: (accounts: Account[]): void => {
    const existingAccounts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNTS) || '[]');
    const otherAccounts = existingAccounts.filter((acc: Account) => 
      !accounts.some(newAcc => newAcc.userId === acc.userId)
    );
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify([...otherAccounts, ...accounts]));
    // replicate to Supabase if configured (fire-and-forget)
    try {
      if (isSupabaseConfigured()) {
        upsertAccounts(accounts).catch(() => {/* ignore replication errors */});
      }
    } catch (e) {
      // noop
    }
  },
  
  getCategories: (): Category[] => {
    const categories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return categories ? JSON.parse(categories) : [];
  },
  
  setCategories: (categories: Category[]): void => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    try {
      if (isSupabaseConfigured()) {
        upsertCategories(categories).catch(() => {});
      }
    } catch (e) {}
  },
  
  getTransactions: (userId: string): Transaction[] => {
    const transactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const allTransactions = transactions ? JSON.parse(transactions) : [];
    return allTransactions.filter((transaction: Transaction) => transaction.userId === userId);
  },
  
  setTransactions: (transactions: Transaction[]): void => {
    const existingTransactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    const otherTransactions = existingTransactions.filter((trans: Transaction) => 
      !transactions.some(newTrans => newTrans.userId === trans.userId)
    );
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([...otherTransactions, ...transactions]));
    try {
      if (isSupabaseConfigured()) {
        upsertTransactions(transactions).catch(() => {});
      }
    } catch (e) {}
  },
  
  getBudgets: (userId: string): Budget[] => {
    const budgets = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    const allBudgets = budgets ? JSON.parse(budgets) : [];
    return allBudgets.filter((budget: Budget) => budget.userId === userId);
  },
  
  setBudgets: (budgets: Budget[]): void => {
    const existingBudgets = JSON.parse(localStorage.getItem(STORAGE_KEYS.BUDGETS) || '[]');
    const otherBudgets = existingBudgets.filter((budget: Budget) => 
      !budgets.some(newBudget => newBudget.userId === budget.userId)
    );
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify([...otherBudgets, ...budgets]));
    try {
      if (isSupabaseConfigured()) {
        upsertBudgets(budgets).catch(() => {});
      }
    } catch (e) {}
  },
  
  getTheme: (): 'light' | 'dark' => {
    return localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark' || 'light';
  },
  
  setTheme: (theme: 'light' | 'dark'): void => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },
  
  clearAll: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
  // Fetch user data from Supabase and overwrite localStorage (used after login)
  syncFromRemote: async (userId: string): Promise<void> => {
    if (!isSupabaseConfigured()) return;
    try {
      const { accounts, categories, transactions, budgets } = await fetchAllForUser(userId);
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts || []));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories || []));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions || []));
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets || []));
    } catch (e) {
      // ignore sync errors
    }
  }
};