import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '../../utils/storage';
import { calculateBudgetsSpent } from '../../utils/budgets';
import { Transaction } from '../../types';

describe('Budgets CRUD and sync', () => {
  const userId = 'test-user';
  // Provide a simple localStorage mock for the Node test environment
  beforeEach(() => {
    const store: Record<string,string> = {};
    const mock = {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    } as Storage;
    (globalThis as any).localStorage = mock;
  });
  // clear storage keys relevant before each test
  beforeEach(() => {
    storage.setAccounts([]);
    storage.setCategories([]);
    storage.setTransactions([]);
    storage.setBudgets([]);
  });

  it('creates a budget and synchronizes spent after adding transactions', () => {
    const cat = { id: 'cat1', name: 'Comida', parentId: null, color: '#fff', icon: '', createdAt: new Date().toISOString() };
    storage.setCategories([cat]);

    const budget = { id: 'b1', userId, month: '2025-08', categoryId: cat.id, amount: 200, spent: 0, createdAt: '', updatedAt: '' };
    storage.setBudgets([budget]);

  const tx1 = { id: 't1', userId, date: '2025-08-05T00:00:00', accountId: 'a1', type: 'expense' as Transaction['type'], categoryId: cat.id, amount: 30, note: '', tags: [], attachmentUrl: null, createdAt: '', updatedAt: '' } as Transaction;
  storage.setTransactions([tx1]);

    const budgets = storage.getBudgets(userId);
    const transactions = storage.getTransactions(userId);

    const recalced = calculateBudgetsSpent(transactions, budgets);
    expect(recalced.find(b => b.id === 'b1')!.spent).toBe(30);
  });

  it('updates a budget and deleting transaction recalculates spent', () => {
    const cat = { id: 'cat2', name: 'Transporte', parentId: null, color: '#fff', icon: '', createdAt: new Date().toISOString() };
    storage.setCategories([cat]);

    const budget = { id: 'b2', userId, month: '2025-08', categoryId: cat.id, amount: 100, spent: 0, createdAt: '', updatedAt: '' };
    storage.setBudgets([budget]);

  const tx1 = { id: 't2', userId, date: '2025-08-10T00:00:00', accountId: 'a1', type: 'expense' as Transaction['type'], categoryId: cat.id, amount: 40, note: '', tags: [], attachmentUrl: null, createdAt: '', updatedAt: '' } as Transaction;
  const tx2 = { id: 't3', userId, date: '2025-08-12T00:00:00', accountId: 'a1', type: 'expense' as Transaction['type'], categoryId: cat.id, amount: 20, note: '', tags: [], attachmentUrl: null, createdAt: '', updatedAt: '' } as Transaction;
  storage.setTransactions([tx1, tx2]);

    let budgets = storage.getBudgets(userId);
    let transactions = storage.getTransactions(userId);
    let recalced = calculateBudgetsSpent(transactions, budgets);
    expect(recalced.find(b => b.id === 'b2')!.spent).toBe(60);

    // delete tx2
  storage.setTransactions([tx1]);
    budgets = storage.getBudgets(userId);
    transactions = storage.getTransactions(userId);
    recalced = calculateBudgetsSpent(transactions, budgets);
    expect(recalced.find(b => b.id === 'b2')!.spent).toBe(40);
  });
});
