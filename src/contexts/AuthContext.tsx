import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, AuthState } from '../types';
import { storage } from '../utils/storage';
import { createSeedData } from '../utils/seeding';
import { createPasswordHash, verifyPassword } from '../utils/auth';
import { useToast } from '../hooks/useToast';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  startFromZero: () => void;
  loadDemoData: () => void;
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

  const { success, error } = useToast();

  useEffect(() => {
    // Cargar usuario al iniciar
    const user = storage.getUser();
    const token = storage.getToken();
    
    if (user && token) {
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
    } else {
  // No crear usuario demo automáticamente en producción.
  // Mantener la app en estado no autenticado para que el usuario real se registre.
  dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Start from zero: create a demo user but with empty datasets
  const startFromZero = () => {
  // clear existing stored data so empty arrays actually replace previous values
  storage.clearAll();

  const demoId = uuidv4();
    const demoUser: User = {
      id: demoId,
      email: 'demo@local',
      name: 'Usuario Demo',
      currency: 'COP',
      locale: 'es-CO',
      theme: 'light',
      createdAt: new Date().toISOString(),
    };

    const demoToken = `token_demo_${Date.now()}`;
    storage.setUser(demoUser);
    storage.setToken(demoToken);

  // explicitly set empty collections
  storage.setAccounts([]);
  storage.setCategories([]);
  storage.setTransactions([]);
  storage.setBudgets([]);

    dispatch({ type: 'LOGIN_SUCCESS', payload: { user: demoUser, token: demoToken } });
    success('Iniciado desde cero', 'Ahora puedes ingresar tus propios datos');
  };

  const loadDemoData = () => {
  // clear existing stored data first
  storage.clearAll();

  const demoId = uuidv4();
    const demoUser: User = {
      id: demoId,
      email: 'demo@local',
      name: 'Usuario Demo',
      currency: 'COP',
      locale: 'es-CO',
      theme: 'light',
      createdAt: new Date().toISOString(),
    };

    const demoToken = `token_demo_${Date.now()}`;
    storage.setUser(demoUser);
    storage.setToken(demoToken);

    const { accounts, categories, transactions, budgets } = createSeedData(demoId);
    storage.setAccounts(accounts);
    storage.setCategories(categories);
    storage.setTransactions(transactions);
    storage.setBudgets(budgets);

    dispatch({ type: 'LOGIN_SUCCESS', payload: { user: demoUser, token: demoToken } });
    success('Datos de ejemplo cargados', 'Puedes editarlos o empezar desde cero');
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    // Simular latencia
    await new Promise(resolve => setTimeout(resolve, 400));

    const storedUser = storage.getUser();
    if (storedUser && storedUser.email === email) {
      const ok = await verifyPassword(password, storedUser.passwordHash);
      if (ok) {
        const token = `token_${Date.now()}`;
        storage.setToken(token);
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user: storedUser, token } });
        success('Login correcto', 'Bienvenido');
        return true;
      }
    }

    dispatch({ type: 'SET_LOADING', payload: false });
    error('Error de autenticación', 'Email o contraseña incorrectos');
    return false;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    await new Promise(resolve => setTimeout(resolve, 400));

    const userId = uuidv4();
    const passwordHash = await createPasswordHash(password);

    const user: User = {
      id: userId,
      email,
      name,
      passwordHash,
      currency: 'COP',
      locale: 'es-CO',
      theme: 'light',
      createdAt: new Date().toISOString(),
    };

    const token = `token_${Date.now()}`;

    // Guardar usuario y generar datos de ejemplo
    storage.setUser(user);
    storage.setToken(token);

    const { accounts, categories, transactions, budgets } = createSeedData(userId);
    storage.setAccounts(accounts);
    storage.setCategories(categories);
    storage.setTransactions(transactions);
    storage.setBudgets(budgets);

    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
    success('Cuenta creada', 'Tu cuenta ha sido creada correctamente');
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
  startFromZero,
  loadDemoData,
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