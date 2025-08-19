import React, { useState } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../hooks/useToast';
// ...existing code...

interface QuickTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickTransactionModal: React.FC<QuickTransactionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { accounts, categories, createTransaction } = useApp();
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    type: 'expense',
    accountId: '',
    categoryId: '',
    amount: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.accountId || !formData.amount) {
      error('Error', 'Por favor completa los campos requeridos');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      error('Error', 'El monto debe ser mayor a 0');
      return;
    }

    createTransaction({
      date: formData.date + 'T00:00:00.000Z',
      accountId: formData.accountId,
      type: formData.type as 'income' | 'expense',
      categoryId: formData.categoryId || null,
      amount,
      note: formData.note,
      tags: [],
      attachmentUrl: null,
    });

    success('Transacción creada', 'La transacción se ha guardado exitosamente');
    setFormData({
      type: 'expense',
      accountId: '',
      categoryId: '',
      amount: '',
      note: '',
      date: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const accountOptions = accounts.map(account => ({
    value: account.id,
    label: account.name,
  }));

  const categoryOptions = [
    { value: '', label: 'Sin categoría' },
    ...categories.map(category => ({
      value: category.id,
      label: category.name,
    })),
  ];

  const typeOptions = [
    { value: 'expense', label: 'Gasto' },
    { value: 'income', label: 'Ingreso' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Transacción" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Tipo"
            name="type"
            value={formData.type}
            onChange={handleChange}
            options={typeOptions}
            required
          />
          
          <Input
            label="Fecha"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <Select
          label="Cuenta"
          name="accountId"
          value={formData.accountId}
          onChange={handleChange}
          options={[{ value: '', label: 'Selecciona una cuenta' }, ...accountOptions]}
          required
        />

        <Select
          label="Categoría"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          options={categoryOptions}
        />

        <Input
          label="Monto"
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="0"
          step="0.01"
          min="0"
          required
        />

        <Input
          label="Nota (opcional)"
          type="text"
          name="note"
          value={formData.note}
          onChange={handleChange}
          placeholder="Descripción de la transacción"
        />

        <div className="flex space-x-3 pt-4">
          <Button type="submit" className="flex-1">
            Guardar
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
};