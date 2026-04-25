import { useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { PagedTableNavigation } from '../components/PagedTableNavigation';
import { usePagedResource } from '../hooks/usePagedResource';
import { deleteExpense, fetchExpenses, saveExpenses } from '../lib/api';
import { toErrorMessage } from '../lib/errors';
import { ACCESS_DENIED_MESSAGE, isAdminUser } from '../lib/auth';
import { formatCurrency, titleize } from '../lib/format';
import type { ExpenseDto, ExpenseType } from '../types';

const expenseTypes: ExpenseType[] = [
  'CONSTRUCTION',
  'MAINTENANCE',
  'ELECTRICITY',
  'WATER',
  'FUNCTION',
  'DONATION_OUTFLOW',
  'PURCHASES',
  'SALARIES',
  'DECORATION',
  'SECURITY',
  'CLEANING',
  'RENOVATION',
  'MARKETING',
  'LEGAL_FEES',
  'PROPERTY_TAX',
  'MISCELLANEOUS',
];
const PAGE_SIZE = 20;

const emptyExpense = (): ExpenseDto => ({
  name: '',
  amount: '',
  expenseType: 'MAINTENANCE',
});

export function Expenses() {
  const [form, setForm] = useState<ExpenseDto>(emptyExpense());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const {
    items: expenses,
    currentPage,
    totalPages,
    totalElements,
    error,
    isLoading,
    setCurrentPage,
    setError,
    loadPage: loadExpenses,
  } = usePagedResource<ExpenseDto>({
    pageSize: PAGE_SIZE,
    errorMessage: 'Failed to load expenses',
    loader: fetchExpenses,
  });

  function openCreateModal() {
    if (!isAdminUser()) {
      setError(ACCESS_DENIED_MESSAGE);
      return;
    }
    setEditingId(null);
    setForm(emptyExpense());
    setIsModalOpen(true);
  }

  function openEditModal(expense: ExpenseDto) {
    if (!isAdminUser()) {
      setError(ACCESS_DENIED_MESSAGE);
      return;
    }
    setEditingId(expense.id ?? null);
    setForm({ ...expense, amount: Number(expense.amount) });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyExpense());
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAdminUser()) {
      setError(ACCESS_DENIED_MESSAGE);
      return;
    }
    setError('');

    if (!form.name.trim()) {
      setError('Enter the payee name before saving the expense.');
      return;
    }

    setIsSaving(true);
    try {
      await saveExpenses([
        {
          ...form,
          id: editingId ?? undefined,
          amount: Number(form.amount),
        },
      ]);
      closeModal();
      await loadExpenses();
    } catch (err) {
      setError(toErrorMessage(err, 'Failed to save expense'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(expenseId?: number) {
    if (!isAdminUser()) {
      setError(ACCESS_DENIED_MESSAGE);
      return;
    }
    if (!expenseId || !window.confirm('Delete this expense?')) {
      return;
    }
    try {
      await deleteExpense(expenseId);
      await loadExpenses();
    } catch (err) {
      setError(toErrorMessage(err, 'Failed to delete expense'));
    }
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

  return (
    <div className="p-5 sm:p-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-orange-500">Transactions</p>
          <h1 className="mt-3 text-3xl font-semibold text-stone-900">Expenses</h1>
          <p className="mt-2 text-sm text-stone-500">
            Track operational outflow and expense heads from the trust balance.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-2xl bg-stone-900 px-5 py-3 text-white transition hover:bg-orange-600"
        >
          <Plus className="h-5 w-5" />
          Add expense
        </button>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mb-6 rounded-[1.75rem] bg-gradient-to-r from-rose-500 to-red-600 p-6 text-white shadow-lg shadow-rose-200/60">
        <p className="text-sm text-white/80">Current page total</p>
        <p className="mt-3 text-3xl font-semibold">{formatCurrency(totalExpenses)}</p>
        <p className="mt-2 text-sm text-white/80">{totalElements} expense records overall</p>
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-stone-50">
              <tr className="text-left text-xs uppercase tracking-[0.2em] text-stone-500">
                <th className="px-6 py-4">Payee</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-t border-stone-100">
                  <td className="px-6 py-5 font-medium text-stone-900">{expense.name}</td>
                  <td className="px-6 py-5 text-sm text-stone-600">{titleize(expense.expenseType)}</td>
                  <td className="px-6 py-5 font-semibold text-rose-600">
                    {formatCurrency(Number(expense.amount || 0))}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(expense)}
                        className="rounded-xl border border-stone-200 p-2 text-stone-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(expense.id)}
                        className="rounded-xl border border-stone-200 p-2 text-stone-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isLoading && expenses.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-stone-500">No expenses found.</div>
        ) : (
          <PagedTableNavigation
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={PAGE_SIZE}
            isLoading={isLoading}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 p-4">
          <div className="w-full max-w-2xl rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
              <div>
                <h2 className="text-2xl font-semibold text-stone-900">
                  {editingId ? 'Edit expense' : 'Add expense'}
                </h2>
                <p className="text-sm text-stone-500">Expense save is validated against current balance.</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-stone-200 p-2 text-stone-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form className="grid gap-5 p-6 md:grid-cols-2" onSubmit={handleSubmit}>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm text-stone-600">Payee name</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  required
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-stone-600">Amount</span>
                <input
                  type="number"
                  min="1"
                  value={form.amount}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      amount: event.target.value === '' ? '' : Number(event.target.value),
                    })
                  }
                  required
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-stone-600">Expense type</span>
                <select
                  value={form.expenseType}
                  onChange={(event) =>
                    setForm({ ...form, expenseType: event.target.value as ExpenseType })
                  }
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                >
                  {expenseTypes.map((item) => (
                    <option key={item} value={item}>
                      {titleize(item)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="col-span-full flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-2xl border border-stone-200 px-5 py-3 text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-2xl bg-stone-900 px-5 py-3 text-white transition hover:bg-orange-600 disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : editingId ? 'Update expense' : 'Create expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
