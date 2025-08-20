import { Transaction, Budget } from '../types';

// Suma los gastos por presupuesto (mes y categoría)
export function calculateBudgetsSpent(transactions: Transaction[], budgets: Budget[]): Budget[] {
  return budgets.map(budget => {
    const monthStart = new Date(budget.month + '-01T00:00:00');
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    const spent = transactions.reduce((sum, t) => {
      if (t.type !== 'expense') return sum;
      const tDate = new Date(t.date);
      if (tDate < monthStart || tDate >= monthEnd) return sum;
      if (budget.categoryId && t.categoryId !== budget.categoryId) return sum;
      return sum + t.amount;
    }, 0);

    return { ...budget, spent };
  });
}

export default calculateBudgetsSpent;
