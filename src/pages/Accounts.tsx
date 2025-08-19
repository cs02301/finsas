import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';

export const Accounts: React.FC = () => {
  const { accounts, createAccount } = useApp();
  const [name, setName] = useState('');
  const [type, setType] = useState<'cash' | 'bank' | 'card'>('cash');
  const [balance, setBalance] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAccount({ name, type, currency: 'COP', openingBalance: balance });
    setName('');
    setBalance(0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cuentas</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <input
          className="w-full p-2 border rounded"
          placeholder="Nombre"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <select
          className="w-full p-2 border rounded"
          value={type}
          onChange={e => setType(e.target.value as 'cash' | 'bank' | 'card')}
        >
          <option value="cash">Efectivo</option>
          <option value="bank">Banco</option>
          <option value="card">Tarjeta</option>
        </select>
        <input
          type="number"
          className="w-full p-2 border rounded"
          placeholder="Saldo inicial"
          value={balance}
          onChange={e => setBalance(Number(e.target.value))}
          required
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Crear
        </button>
      </form>

      <ul className="space-y-2">
        {accounts.map(account => (
          <li key={account.id} className="p-4 border rounded">
            <div className="font-semibold">{account.name}</div>
            <div className="text-sm text-gray-600">
              {account.type} - {account.currentBalance.toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
