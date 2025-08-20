import { describe, it, expect } from 'vitest';
import { calculateBudgetsSpent } from '../budgets';

describe('calculateBudgetsSpent', () => {
  it('sums expenses for matching month and category', () => {
    const transactions = [
      { id: 't1', userId: 'u', date: '2025-08-05T00:00:00', accountId: 'a', type: 'expense', categoryId: 'c1', amount: 50, note: '', tags: [], attachmentUrl: null, createdAt: '', updatedAt: '' },
      { id: 't2', userId: 'u', date: '2025-08-10T00:00:00', accountId: 'a', type: 'expense', categoryId: 'c2', amount: 30, note: '', tags: [], attachmentUrl: null, createdAt: '', updatedAt: '' },
      { id: 't3', userId: 'u', date: '2025-08-12T00:00:00', accountId: 'a', type: 'income', categoryId: null, amount: 200, note: '', tags: [], attachmentUrl: null, createdAt: '', updatedAt: '' },
    ];

    const budgets = [
      { id: 'b1', userId: 'u', month: '2025-08', categoryId: 'c1', amount: 100, spent: 0, createdAt: '', updatedAt: '' },
      { id: 'b2', userId: 'u', month: '2025-08', categoryId: null, amount: 500, spent: 0, createdAt: '', updatedAt: '' },
    ];

    const result = calculateBudgetsSpent(transactions as any, budgets as any);
    const b1 = result.find(r => r.id === 'b1')!;
    const b2 = result.find(r => r.id === 'b2')!;

    expect(b1.spent).toBe(50);
    expect(b2.spent).toBe(80); // both expenses counted for global budget
  });
});
