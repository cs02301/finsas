import { v4 as uuidv4 } from 'uuid';
import { Account, Category, Transaction, Budget } from '../types';
import { DEFAULT_CATEGORIES } from './constants';
import { getCurrentMonth } from './date';

export const createSeedData = (userId: string) => {
  // Cuentas de ejemplo
  const accounts: Account[] = [
    {
      id: uuidv4(),
      userId,
      name: 'Efectivo',
      type: 'cash',
      currency: 'COP',
      openingBalance: 500000,
      currentBalance: 750000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      userId,
      name: 'Cuenta Ahorros',
      type: 'bank',
      currency: 'COP',
      openingBalance: 2000000,
      currentBalance: 2850000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      userId,
      name: 'Tarjeta Crédito',
      type: 'card',
      currency: 'COP',
      openingBalance: 0,
      currentBalance: -450000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Categorías por defecto
  const categories: Category[] = DEFAULT_CATEGORIES.map(cat => ({
    id: uuidv4(),
    ...cat,
    createdAt: new Date().toISOString(),
  }));

  // Transacciones de ejemplo
  const transactions: Transaction[] = [];
  const now = new Date();
  
  // Generar 20 transacciones en los últimos 90 días
  for (let i = 0; i < 20; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const transactionDate = new Date(now);
    transactionDate.setDate(now.getDate() - daysAgo);
    
    const isIncome = Math.random() < 0.3; // 30% ingresos
    const account = accounts[Math.floor(Math.random() * accounts.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    const amounts = isIncome 
      ? [1500000, 2000000, 500000, 800000] // Ingresos típicos
      : [50000, 80000, 120000, 200000, 35000, 90000]; // Gastos típicos
    
    const amount = amounts[Math.floor(Math.random() * amounts.length)];
    
    transactions.push({
      id: uuidv4(),
      userId,
      date: transactionDate.toISOString(),
      accountId: account.id,
      type: isIncome ? 'income' : 'expense',
      categoryId: category.id,
      amount,
      note: isIncome 
        ? `Ingreso - ${category.name}` 
        : `Gasto en ${category.name}`,
      tags: [],
      attachmentUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Presupuestos del mes actual
  const currentMonth = getCurrentMonth();
  const budgets: Budget[] = [
    {
      id: uuidv4(),
      userId,
      month: currentMonth,
      categoryId: categories.find(c => c.name === 'Comida')?.id || null,
      amount: 800000,
      spent: 450000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      userId,
      month: currentMonth,
      categoryId: categories.find(c => c.name === 'Transporte')?.id || null,
      amount: 300000,
      spent: 150000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      userId,
      month: currentMonth,
      categoryId: categories.find(c => c.name === 'Ocio')?.id || null,
      amount: 400000,
      spent: 420000, // Sobrepasado
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return { accounts, categories, transactions, budgets };
};