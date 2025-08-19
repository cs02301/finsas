import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { Card } from '../UI/Card';
import { formatCurrency } from '../../utils/currency';
import { useAuth } from '../../contexts/AuthContext';

interface StatsCardsProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyNet: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  totalBalance,
  monthlyIncome,
  monthlyExpenses,
  monthlyNet,
}) => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Balance Total',
      value: formatCurrency(totalBalance, user?.currency),
      icon: DollarSign,
      color: totalBalance >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: totalBalance >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900',
    },
    {
      title: 'Ingresos del Mes',
      value: formatCurrency(monthlyIncome, user?.currency),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
    },
    {
      title: 'Gastos del Mes',
      value: formatCurrency(monthlyExpenses, user?.currency),
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900',
    },
    {
      title: 'Resultado del Mes',
      value: formatCurrency(monthlyNet, user?.currency),
      icon: PieChart,
      color: monthlyNet >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: monthlyNet >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${stat.bgColor} mr-4`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </p>
              <p className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};