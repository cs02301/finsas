import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/UI/Button';

export const Transactions: React.FC = () => {
  const { transactions, accounts, categories, deleteTransaction } = useApp();
  const [filter, setFilter] = useState('');

  const filtered = transactions.filter(t =>
    t.note.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Transacciones</h1>
          <p className="text-sm text-gray-500">Lista de transacciones</p>
        </div>
        <div className="flex items-center space-x-2">
          <input placeholder="Buscar" value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 rounded border" />
          <Button onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n' }))}>Nueva</Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuenta</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
              <th className="px-6 py-3"> </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filtered.map(tx => (
              <tr key={tx.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(tx.date).toLocaleDateString('es-CO')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{accounts.find(a => a.id === tx.accountId)?.name || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{categories.find(c => c.id === tx.categoryId)?.name || '—'}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{tx.amount.toLocaleString('es-CO')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button onClick={() => deleteTransaction(tx.id)} className="text-red-600 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;
