import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (date: string | Date, pattern: string = 'dd/MM/yyyy'): string => {
  return format(new Date(date), pattern, { locale: es });
};

export const getCurrentMonth = (): string => {
  return format(new Date(), 'yyyy-MM');
};

export const getMonthRange = (month: string): { start: Date; end: Date } => {
  const date = new Date(month + '-01');
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
};

export const getLast12Months = (): string[] => {
  const months = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = subMonths(now, i);
    months.push(format(date, 'yyyy-MM'));
  }
  
  return months;
};

export const isDateInRange = (date: string, start?: string, end?: string): boolean => {
  const targetDate = new Date(date);
  
  if (!start && !end) return true;
  
  const interval = {
    start: start ? new Date(start) : new Date('1900-01-01'),
    end: end ? new Date(end) : new Date('2100-12-31'),
  };
  
  return isWithinInterval(targetDate, interval);
};