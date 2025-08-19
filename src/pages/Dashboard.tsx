import React, { useMemo } from 'react';
import { StatsCards } from '../components/Dashboard/StatsCards';
import { ExpenseChart } from '../components/Dashboard/ExpenseChart';
import { MonthlyTrendChart } from '../components/Dashboard/MonthlyTrendChart';
import { useApp } from '../contexts/AppContext';
import { getCurrentMonth, getMonthRange, getLast12Months } from '../utils/date';

export const Dashboard: React.FC = () => {
  const { accounts, categories, transactions } = useApp();

  const dashboardData = useMemo(() => {
    const currentMonth = getCurrentMonth();
    const { start: monthStart, end: monthEnd } = getMonthRange(currentMonth);
    
    // Balance total
    const totalBalance = accounts.reduce((sum, account) => sum + account.currentBalance, 0);
    
    // Transacciones del mes actual
    const currentMonthTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= monthStart && transactionDate <= monthEnd;
    });
    
    const monthlyIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyNet = monthlyIncome - monthlyExpenses;
    
    // Gastos por categoría (mes actual)
    const categoryMap = new Map();
    categories.forEach(category => {
      categoryMap.set(category.id, { name: category.name, color: category.color });
    });
    
    const expensesByCategory = currentMonthTransactions
      .filter(t => t.type === 'expense' && t.categoryId)
      .reduce((acc, transaction) => {
        const category = categoryMap.get(transaction.categoryId);
        if (category) {
          const existing = acc.find(item => item.category === category.name);
          if (existing) {
            existing.amount += transaction.amount;
          } else {
            acc.push({
              category: category.name,
              amount: transaction.amount,
              color: category.color,
            });
          }
        }
        return acc;
      }, [] as { category: string; amount: number; color: string }[]);
    
    // Tendencia de últimos 12 meses
    const last12Months = getLast12Months();
    const monthlyTrend = last12Months.map(month => {
      const { start, end } = getMonthRange(month);
      const monthTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= start && transactionDate <= end;
      });
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return { month, income, expenses };
    });
    
    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      monthlyNet,
      expensesByCategory,
      monthlyTrend,
    };
  }, [accounts, categories, transactions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Resumen de tus finanzas personales
        </p>
      </div>

      <StatsCards
        totalBalance={dashboardData.totalBalance}
        monthlyIncome={dashboardData.monthlyIncome}
        monthlyExpenses={dashboardData.monthlyExpenses}
        monthlyNet={dashboardData.monthlyNet}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseChart data={dashboardData.expensesByCategory} />
        <MonthlyTrendChart data={dashboardData.monthlyTrend} />
      </div>
    </div>
  );
};