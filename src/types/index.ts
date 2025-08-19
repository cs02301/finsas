export interface User {
  id: string;
  email: string;
  name: string;
  currency: string;
  locale: string;
  theme: 'light' | 'dark';
  createdAt: string;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: 'cash' | 'bank' | 'card';
  currency: string;
  openingBalance: number;
  currentBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  color: string;
  icon: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  date: string;
  accountId: string;
  toAccountId?: string; // Para transferencias
  type: 'income' | 'expense' | 'transfer';
  categoryId: string | null;
  amount: number;
  note: string;
  tags: string[];
  attachmentUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  month: string; // YYYY-MM
  categoryId: string | null; // null para presupuesto global
  amount: number;
  spent: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AppState {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
}

export interface TransactionFilter {
  dateFrom?: string;
  dateTo?: string;
  accountId?: string;
  categoryId?: string;
  type?: 'income' | 'expense' | 'transfer';
  tags?: string[];
  amountFrom?: number;
  amountTo?: number;
  search?: string;
}

export interface DashboardStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyNet: number;
  expensesByCategory: { category: string; amount: number; color: string }[];
  monthlyTrend: { month: string; income: number; expenses: number }[];
}