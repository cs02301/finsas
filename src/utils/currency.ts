import { CURRENCIES } from './constants';

export const formatCurrency = (amount: number, currency: string = 'COP'): string => {
  const currencyInfo = CURRENCIES[currency as keyof typeof CURRENCIES] || CURRENCIES.COP;
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currencyInfo.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
};