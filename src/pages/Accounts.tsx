import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';

export const Accounts: React.FC = () => {
  const { accounts, createAccount } = useApp();
  const [form, setForm] = useState({ name: '', type: 'cash', openingBalance: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const target = e.target as HTMLInputElement | HTMLSelectElement;
      const { name, value } = target;
      setForm(prev => ({ ...prev, [name]: value }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const openingBalance = parseFloat(form.openingBalance || '0') || 0;
    createAccount({
      name: form.name,
      type: form.type as 'cash' | 'bank' | 'card',
      currency: 'COP',
      openingBalance,
    });
    setForm({ name: '', type: 'cash', openingBalance: '' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Cuentas</h1>

      <div className="mb-6 max-w-md bg-white dark:bg-gray-800 p-4 rounded shadow">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Nombre" name="name" value={form.name} onChange={handleChange} required />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
            <select name="type" value={form.type} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="cash">Efectivo</option>
              <option value="bank">Cuenta bancaria</option>
              <option value="card">Tarjeta</option>
            </select>
          </div>

          <Input label="Saldo inicial" name="openingBalance" type="number" value={form.openingBalance} onChange={handleChange} />

          <Button type="submit">Crear cuenta</Button>
        </form>
      </div>

      <div className="space-y-2">
        {accounts.map(acc => (
          <div key={acc.id} className="p-4 bg-white dark:bg-gray-800 rounded shadow flex justify-between">
            <div>
              <div className="font-semibold">{acc.name}</div>
              <div className="text-sm text-gray-500">{acc.type}</div>
            </div>
            <div className={`font-medium ${acc.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {acc.currentBalance.toLocaleString('es-CO')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Accounts;
