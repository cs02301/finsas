import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Account, Category, Transaction, Budget, AppState, TransactionFilter } from '../types';
import { storage } from '../utils/storage';
import { useAuth } from './AuthContext';

interface AppContextType extends AppState {
  // Accounts
  createAccount: (account: Omit<Account, 'id' | 'userId' | 'currentBalance' | 'createdAt' | 'updatedAt'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  
  // Categories
  createCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  // Transactions
  createTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getFilteredTransactions: (filter: TransactionFilter) => Transaction[];
  
  // Budgets
  createBudget: (budget: Omit<Budget, 'id' | 'userId' | 'spent' | 'createdAt' | 'updatedAt'>) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  
  // Utils
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

type AppAction = 
  | { type: 'SET_DATA'; payload: AppState }
  | { type: 'ADD_ACCOUNT'; payload: Account }
  | { type: 'UPDATE_ACCOUNT'; payload: { id: string; updates: Partial<Account> } }
  | { type: 'DELETE_ACCOUNT'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: { id: string; updates: Partial<Category> } }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: { id: string; updates: Partial<Transaction> } }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_BUDGET'; payload: Budget }
  | { type: 'UPDATE_BUDGET'; payload: { id: string; updates: Partial<Budget> } }
  | { type: 'DELETE_BUDGET'; payload: string };

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_DATA':
      return action.payload;
    
    case 'ADD_ACCOUNT':
      return { ...state, accounts: [...state.accounts, action.payload] };
    
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map(account =>
          account.id === action.payload.id ? { ...account, ...action.payload.updates } : account
        ),
      };
    
    case 'DELETE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.filter(account => account.id !== action.payload),
      };
    
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.id ? { ...category, ...action.payload.updates } : category
        ),
      };
    
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(category => category.id !== action.payload),
      };
    
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, action.payload] };
    
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(transaction =>
          transaction.id === action.payload.id ? { ...transaction, ...action.payload.updates } : transaction
        ),
      };
    
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(transaction => transaction.id !== action.payload),
      };
    
    case 'ADD_BUDGET':
      return { ...state, budgets: [...state.budgets, action.payload] };
    
    case 'UPDATE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.map(budget =>
          budget.id === action.payload.id ? { ...budget, ...action.payload.updates } : budget
        ),
      };
    
    case 'DELETE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.filter(budget => budget.id !== action.payload),
      };
    
    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(appReducer, {
    accounts: [],
    categories: [],
    transactions: [],
    budgets: [],
  });

  const loadData = useCallback(() => {
    if (!user) return;

    const accounts = storage.getAccounts(user.id);
    const categories = storage.getCategories();
    const transactions = storage.getTransactions(user.id);
    const budgets = storage.getBudgets(user.id);

    dispatch({ type: 'SET_DATA', payload: { accounts, categories, transactions, budgets } });
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadData();
    }
  }, [isAuthenticated, loadData, user]);

  // Calcular balances de cuentas
  const calculateAccountBalances = (accounts: Account[], transactions: Transaction[]) => {
    return accounts.map(account => {
      const accountTransactions = transactions.filter(t => 
        t.accountId === account.id || t.toAccountId === account.id
      );
      
      let balance = account.openingBalance;
      
      accountTransactions.forEach(transaction => {
        if (transaction.accountId === account.id) {
          if (transaction.type === 'income') {
            balance += transaction.amount;
          } else if (transaction.type === 'expense') {
            balance -= transaction.amount;
          } else if (transaction.type === 'transfer') {
            balance -= transaction.amount;
          }
        }
        
        if (transaction.toAccountId === account.id && transaction.type === 'transfer') {
          balance += transaction.amount;
        }
      });
      
      return { ...account, currentBalance: balance };
    });
  };

  const saveAccounts = (accounts: Account[]) => {
    const updatedAccounts = calculateAccountBalances(accounts, state.transactions);
    storage.setAccounts(updatedAccounts);
    return updatedAccounts;
  };

  // Account operations
  const createAccount = (accountData: Omit<Account, 'id' | 'userId' | 'currentBalance' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    const account: Account = {
      ...accountData,
      id: uuidv4(),
      userId: user.id,
      currentBalance: accountData.openingBalance,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedAccounts = [...state.accounts, account];
    saveAccounts(updatedAccounts);
    dispatch({ type: 'ADD_ACCOUNT', payload: account });
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    const updatedAccounts = state.accounts.map(account =>
      account.id === id ? { ...account, ...updates, updatedAt: new Date().toISOString() } : account
    );
    saveAccounts(updatedAccounts);
    dispatch({ type: 'UPDATE_ACCOUNT', payload: { id, updates: { ...updates, updatedAt: new Date().toISOString() } } });
  };

  const deleteAccount = (id: string) => {
    const updatedAccounts = state.accounts.filter(account => account.id !== id);
    saveAccounts(updatedAccounts);
    dispatch({ type: 'DELETE_ACCOUNT', payload: id });
  };

  // Category operations
  const createCategory = (categoryData: Omit<Category, 'id' | 'createdAt'>) => {
    const category: Category = {
      ...categoryData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    
    const updatedCategories = [...state.categories, category];
    storage.setCategories(updatedCategories);
    dispatch({ type: 'ADD_CATEGORY', payload: category });
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    const updatedCategories = state.categories.map(category =>
      category.id === id ? { ...category, ...updates } : category
    );
    storage.setCategories(updatedCategories);
    dispatch({ type: 'UPDATE_CATEGORY', payload: { id, updates } });
  };

  const deleteCategory = (id: string) => {
    const updatedCategories = state.categories.filter(category => category.id !== id);
    storage.setCategories(updatedCategories);
    dispatch({ type: 'DELETE_CATEGORY', payload: id });
  };

  // Transaction operations
  const createTransaction = (transactionData: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    const transaction: Transaction = {
      ...transactionData,
      id: uuidv4(),
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedTransactions = [...state.transactions, transaction];
    storage.setTransactions(updatedTransactions);
    
    // Actualizar balances de cuentas
    const updatedAccounts = calculateAccountBalances(state.accounts, updatedTransactions);
    storage.setAccounts(updatedAccounts);
    
    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    updatedAccounts.forEach(account => {
      dispatch({ type: 'UPDATE_ACCOUNT', payload: { id: account.id, updates: { currentBalance: account.currentBalance } } });
    });
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const updatedTransactions = state.transactions.map(transaction =>
      transaction.id === id ? { ...transaction, ...updates, updatedAt: new Date().toISOString() } : transaction
    );
    storage.setTransactions(updatedTransactions);
    
    // Actualizar balances de cuentas
    const updatedAccounts = calculateAccountBalances(state.accounts, updatedTransactions);
    storage.setAccounts(updatedAccounts);
    
    dispatch({ type: 'UPDATE_TRANSACTION', payload: { id, updates: { ...updates, updatedAt: new Date().toISOString() } } });
    updatedAccounts.forEach(account => {
      dispatch({ type: 'UPDATE_ACCOUNT', payload: { id: account.id, updates: { currentBalance: account.currentBalance } } });
    });
  };

  const deleteTransaction = (id: string) => {
    const updatedTransactions = state.transactions.filter(transaction => transaction.id !== id);
    storage.setTransactions(updatedTransactions);
    
    // Actualizar balances de cuentas
    const updatedAccounts = calculateAccountBalances(state.accounts, updatedTransactions);
    storage.setAccounts(updatedAccounts);
    
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
    updatedAccounts.forEach(account => {
      dispatch({ type: 'UPDATE_ACCOUNT', payload: { id: account.id, updates: { currentBalance: account.currentBalance } } });
    });
  };

  const getFilteredTransactions = (filter: TransactionFilter): Transaction[] => {
    return state.transactions.filter(transaction => {
      // Date range filter
      if (filter.dateFrom || filter.dateTo) {
        const transactionDate = new Date(transaction.date);
        if (filter.dateFrom && transactionDate < new Date(filter.dateFrom)) return false;
        if (filter.dateTo && transactionDate > new Date(filter.dateTo)) return false;
      }
      
      // Account filter
      if (filter.accountId && transaction.accountId !== filter.accountId) return false;
      
      // Category filter
      if (filter.categoryId && transaction.categoryId !== filter.categoryId) return false;
      
      // Type filter
      if (filter.type && transaction.type !== filter.type) return false;
      
      // Amount range filter
      if (filter.amountFrom && transaction.amount < filter.amountFrom) return false;
      if (filter.amountTo && transaction.amount > filter.amountTo) return false;
      
      // Search filter
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        const matchesNote = transaction.note.toLowerCase().includes(searchTerm);
        const matchesTags = transaction.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        if (!matchesNote && !matchesTags) return false;
      }
      
      // Tags filter
      if (filter.tags && filter.tags.length > 0) {
        const hasMatchingTag = filter.tags.some(tag => transaction.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }
      
      return true;
    });
  };

  // Budget operations
  const createBudget = (budgetData: Omit<Budget, 'id' | 'userId' | 'spent' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    const budget: Budget = {
      ...budgetData,
      id: uuidv4(),
      userId: user.id,
      spent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedBudgets = [...state.budgets, budget];
    storage.setBudgets(updatedBudgets);
    dispatch({ type: 'ADD_BUDGET', payload: budget });
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    const updatedBudgets = state.budgets.map(budget =>
      budget.id === id ? { ...budget, ...updates, updatedAt: new Date().toISOString() } : budget
    );
    storage.setBudgets(updatedBudgets);
    dispatch({ type: 'UPDATE_BUDGET', payload: { id, updates: { ...updates, updatedAt: new Date().toISOString() } } });
  };

  const deleteBudget = (id: string) => {
    const updatedBudgets = state.budgets.filter(budget => budget.id !== id);
    storage.setBudgets(updatedBudgets);
    dispatch({ type: 'DELETE_BUDGET', payload: id });
  };

  const refreshData = () => {
    loadData();
  };

  return (
    <AppContext.Provider value={{
      ...state,
      createAccount,
      updateAccount,
      deleteAccount,
      createCategory,
      updateCategory,
      deleteCategory,
      createTransaction,
      updateTransaction,
      deleteTransaction,
      getFilteredTransactions,
      createBudget,
      updateBudget,
      deleteBudget,
      refreshData,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};