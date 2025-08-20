import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../hooks/useToast';
import { Modal } from '../components/UI/Modal';
import { Button } from '../components/UI/Button';
import { ConfirmModal } from '../components/UI/ConfirmModal';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  month: yup.string().required('Selecciona el mes'),
  categoryName: yup.string().nullable(),
  amount: yup.number().required('El monto es requerido').moreThan(0, 'El monto debe ser mayor que 0'),
});

type FormValues = {
  month: string;
  categoryName?: string | null;
  amount: number;
};

const BudgetForm: React.FC<{
  initial?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  categories: any[];
}> = ({ initial = {}, onSave, onCancel, categories = [] }) => {
  const methods = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      month: initial.month || new Date().toISOString().slice(0,7),
      categoryName: initial.categoryId ? categories.find(c => c.id === initial.categoryId)?.name : '',
      amount: initial.amount ?? 0,
    },
  });

  const { register, handleSubmit, formState: { errors } } = methods;

  const categoryOptions = useMemo(() => categories.map(c => c.name), [categories]);

  return (
    <form onSubmit={handleSubmit((data) => {
      const category = categories.find(c => c.name === data.categoryName);
      onSave({ month: data.month, categoryId: category ? category.id : null, amount: data.amount });
    })}>
      <div className="grid grid-cols-1 gap-4">
        <label className="block">
          <div className="text-sm font-medium">Mes</div>
          <input type="month" {...register('month')} className="mt-1 block w-full rounded border px-3 py-2" />
          {errors.month && <div className="text-sm text-red-500 mt-1">{errors.month.message}</div>}
        </label>

        <label className="block">
          <div className="text-sm font-medium">Categoría (autocompletar por nombre)</div>
          <input list="categories-list" {...register('categoryName')} className="mt-1 block w-full rounded border px-3 py-2" />
          <datalist id="categories-list">
            {categoryOptions.map(name => <option key={name} value={name} />)}
          </datalist>
        </label>

        <label className="block">
          <div className="text-sm font-medium">Monto</div>
          <input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} className="mt-1 block w-full rounded border px-3 py-2" />
          {errors.amount && <div className="text-sm text-red-500 mt-1">{errors.amount.message}</div>}
        </label>
      </div>

      <div className="mt-4 flex justify-end space-x-2">
        <Button onClick={onCancel} variant="secondary" type="button">Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
};

export const Budgets: React.FC = () => {
  const { budgets, createBudget, updateBudget, deleteBudget, categories } = useApp() as any;
  const { success, error } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);

  const openNew = () => { setEditing(null); setIsOpen(true); };
  const openEdit = (b: any) => { setEditing(b); setIsOpen(true); };

  const handleSave = (data: any) => {
    try {
      if (editing) {
        updateBudget(editing.id, { ...data });
        success('Presupuesto actualizado');
      } else {
        createBudget({ ...data });
        success('Presupuesto creado');
      }
      setIsOpen(false);
    } catch (e) {
      error('Error', 'No se pudo guardar el presupuesto');
    }
  };

  const handleDelete = (id: string) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!toDeleteId) return;
    deleteBudget(toDeleteId);
    success('Presupuesto eliminado');
    setConfirmOpen(false);
    setToDeleteId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Presupuestos</h1>
          <p className="text-sm text-gray-500">Gestiona tus presupuestos mensuales</p>
        </div>
        <div>
          <Button onClick={openNew}>Nuevo presupuesto</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {budgets.length === 0 && (
          <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">No hay presupuestos.</div>
        )}

        {budgets.map((b: any) => {
          const pct = b.amount > 0 ? Math.round((b.spent / b.amount) * 100) : 0;
          return (
            <div key={b.id} className="p-4 bg-white dark:bg-gray-800 rounded shadow flex items-center justify-between">
              <div>
                <div className="font-semibold">{b.month} {b.categoryId ? `- ${categories.find((c: any) => c.id === b.categoryId)?.name || ''}` : '- Global'}</div>
                <div className="text-sm text-gray-500">Gastado: {b.spent.toLocaleString()} / {b.amount.toLocaleString()} ({pct}%)</div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded mt-2">
                  <div style={{ width: `${Math.min(100, pct)}%` }} className={`h-2 rounded ${pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button onClick={() => openEdit(b)} variant="secondary">Editar</Button>
                <Button onClick={() => handleDelete(b.id)} variant="danger">Eliminar</Button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? 'Editar presupuesto' : 'Nuevo presupuesto'}>
        <BudgetForm initial={editing} onSave={handleSave} onCancel={() => setIsOpen(false)} />
      </Modal>
    </div>
  );
};

export default Budgets;
