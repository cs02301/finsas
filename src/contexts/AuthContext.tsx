import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, AuthState } from '../types';
import { storage } from '../utils/storage';
import { createSeedData } from '../utils/seeding';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction = 
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<User> }
  | { type: 'SET_LOADING'; payload: boolean };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Cargar usuario al iniciar
    const user = storage.getUser();
    const token = storage.getToken();
    
    if (user && token) {
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    void password;
    dispatch({ type: 'SET_LOADING', payload: true });
    
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verificar credenciales (simulado)
    const storedUser = storage.getUser();
    if (storedUser && storedUser.email === email) {
      const token = `token_${Date.now()}`;
      storage.setToken(token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: storedUser, token } });
      return true;
    }
    
    dispatch({ type: 'SET_LOADING', payload: false });
    return false;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    void password;
    dispatch({ type: 'SET_LOADING', payload: true });
    
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const userId = uuidv4();
    const user: User = {
      id: userId,
      email,
      name,
      currency: 'COP',
      locale: 'es-CO',
      theme: 'light',
      createdAt: new Date().toISOString(),
    };
    
    const token = `token_${Date.now()}`;
    
    // Guardar usuario y generar datos de ejemplo
    storage.setUser(user);
    storage.setToken(token);
    
    // Crear datos semilla
    const { accounts, categories, transactions, budgets } = createSeedData(userId);
    storage.setAccounts(accounts);
    storage.setCategories(categories);
    storage.setTransactions(transactions);
    storage.setBudgets(budgets);
    
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
    return true;
  };

  const logout = () => {
    storage.clearAll();
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = (updates: Partial<User>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...updates };
      storage.setUser(updatedUser);
      dispatch({ type: 'UPDATE_PROFILE', payload: updates });
    }
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};