import React from 'react';
import { useApp } from '../contexts/AppContext';
import { ExpenseChart } from '../components/Dashboard/ExpenseChart';
import { MonthlyTrendChart } from '../components/Dashboard/MonthlyTrendChart';

export const Reports: React.FC = () => {
  const { categories, transactions } = useApp();

  // Simple report: reuse dashboard calculations
  const expensesByCategory = categories.map(cat => ({ category: cat.name, amount: transactions.filter(t => t.type === 'expense' && t.categoryId === cat.id).reduce((s, t) => s + t.amount, 0), color: cat.color }));

  const last12 = transactions.slice(0, 12).map(t => ({ month: t.date.slice(0,7), income: t.type === 'income' ? t.amount : 0, expenses: t.type === 'expense' ? t.amount : 0 }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reportes</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseChart data={expensesByCategory} />
        <MonthlyTrendChart data={last12} />
      </div>
    </div>
  );
};

export default Reports;
