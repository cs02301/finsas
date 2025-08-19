export const CURRENCIES = {
  COP: { symbol: '$', name: 'Peso Colombiano', code: 'COP' },
  USD: { symbol: '$', name: 'US Dollar', code: 'USD' },
  EUR: { symbol: '€', name: 'Euro', code: 'EUR' },
};

export const DEFAULT_CATEGORIES = [
  { name: 'Comida', color: '#F59E0B', icon: 'UtensilsCrossed', parentId: null },
  { name: 'Transporte', color: '#3B82F6', icon: 'Car', parentId: null },
  { name: 'Vivienda', color: '#10B981', icon: 'Home', parentId: null },
  { name: 'Salud', color: '#EF4444', icon: 'Heart', parentId: null },
  { name: 'Ocio', color: '#8B5CF6', icon: 'Gamepad2', parentId: null },
  { name: 'Educación', color: '#F97316', icon: 'GraduationCap', parentId: null },
  { name: 'Impuestos', color: '#6B7280', icon: 'Receipt', parentId: null },
  { name: 'Ingresos', color: '#10B981', icon: 'TrendingUp', parentId: null },
  { name: 'Otros', color: '#6B7280', icon: 'MoreHorizontal', parentId: null },
];

export const ACCOUNT_TYPES = {
  cash: { name: 'Efectivo', icon: 'Banknote' },
  bank: { name: 'Cuenta Bancaria', icon: 'Landmark' },
  card: { name: 'Tarjeta', icon: 'CreditCard' },
};

export const TRANSACTION_TYPES = {
  income: { name: 'Ingreso', color: 'text-green-600' },
  expense: { name: 'Gasto', color: 'text-red-600' },
  transfer: { name: 'Transferencia', color: 'text-blue-600' },
};