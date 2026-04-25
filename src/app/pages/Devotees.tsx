import { useState, type FormEvent } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { PagedTableNavigation } from '../components/PagedTableNavigation';
import { usePagedResource } from '../hooks/usePagedResource';
import { deleteDevotee, fetchDevotees, saveDevotees } from '../lib/api';
import { toErrorMessage } from '../lib/errors';
import { ACCESS_DENIED_MESSAGE, isAdminUser } from '../lib/auth';
import { formatCurrency, titleize } from '../lib/format';
import type { DevoteeDto, DonationType } from '../types';

const donationTypes: DonationType[] = ['ONLINE_UPI', 'CASH', 'CHEQUE', 'OTHER_ONLINE_SERVICE'];
const PAGE_SIZE = 20;

const emptyDevotee = (): DevoteeDto => ({
  firstName: '',
  lastName: '',
  fatherName: '',
  address: {
    houseNumber: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
  },
  donation: [
    {
      amount: '',
      donationType: 'CASH',
      receiptNumber: '',
    },
  ],
});

export function Devotees() {
  const [form, setForm] = useState<DevoteeDto>(emptyDevotee());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const {
    items: devotees,
    currentPage,
    totalPages,
    totalElements,
    error,
    isLoading,
    setCurrentPage,
    setError,
    loadPage: loadDevotees,
  } = usePagedResource<DevoteeDto>({
    pageSize: PAGE_SIZE,
    errorMessage: 'Failed to load devotees',
    loader: fetchDevotees,
  });

  function openCreateModal() {
    if (!isAdminUser()) {
      setError(ACCESS_DENIED_MESSAGE);
      return;
    }
    setForm(emptyDevotee());
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setForm(emptyDevotee());
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAdminUser()) {
      setError(ACCESS_DENIED_MESSAGE);
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      const payload: DevoteeDto = {
        ...form,
        address: {
          ...form.address,
          pincode: Number(form.address.pincode),
        },
        donation: form.donation.map((donation) => ({
          ...donation,
          amount: Number(donation.amount),
        })),
      };
      await saveDevotees([payload]);
      closeModal();
      await loadDevotees();
    } catch (err) {
      setError(toErrorMessage(err, 'Failed to save devotee'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(devoteeId?: number) {
    if (!isAdminUser()) {
      setError(ACCESS_DENIED_MESSAGE);
      return;
    }
    if (!devoteeId || !window.confirm('Delete this devotee record?')) {
      return;
    }
    try {
      await deleteDevotee(devoteeId);
      await loadDevotees();
    } catch (err) {
      setError(toErrorMessage(err, 'Failed to delete devotee'));
    }
  }

  return (
    <div className="p-5 sm:p-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-orange-500">Master Data</p>
          <h1 className="mt-3 text-3xl font-semibold text-stone-900">Devotees</h1>
          <p className="mt-2 text-sm text-stone-500">
            Maintain devotee profiles together with address and donation details.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-2xl bg-stone-900 px-5 py-3 text-white transition hover:bg-orange-600"
        >
          <Plus className="h-5 w-5" />
          Add devotee
        </button>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-stone-50">
              <tr className="text-left text-xs uppercase tracking-[0.2em] text-stone-500">
                <th className="px-6 py-4">Devotee</th>
                <th className="px-6 py-4">Address</th>
                <th className="px-6 py-4">Total Donation</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {devotees.map((devotee) => {
                const donations = Array.isArray(devotee.donation) ? devotee.donation : [];
                const totalDonation = donations.reduce(
                  (sum, donation) => sum + Number(donation.amount || 0),
                  0,
                );
                return (
                  <tr key={devotee.id} className="border-t border-stone-100">
                    <td className="px-6 py-5">
                      <p className="font-medium text-stone-900">
                        {devotee.firstName} {devotee.lastName}
                      </p>
                      <p className="text-sm text-stone-500">Father name: {devotee.fatherName}</p>
                    </td>
                    <td className="px-6 py-5 text-sm text-stone-600">
                      {devotee.address.houseNumber}, {devotee.address.city}, {devotee.address.state}
                    </td>
                    <td className="px-6 py-5">
                      {donations.length > 0 ? (
                        <p className="font-medium text-emerald-600">
                          {formatCurrency(totalDonation)}
                        </p>
                      ) : (
                        <p className="text-sm text-stone-400">No donations</p>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <button
                        type="button"
                        onClick={() => handleDelete(devotee.id)}
                        className="rounded-xl border border-stone-200 p-2 text-stone-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!isLoading && devotees.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-stone-500">No devotees found.</div>
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
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
              <div>
                <h2 className="text-2xl font-semibold text-stone-900">Add devotee</h2>
                <p className="text-sm text-stone-500">
                  Devotee records currently require one donation entry on save.
                </p>
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
              <label className="block">
                <span className="mb-2 block text-sm text-stone-600">First name</span>
                <input
                  value={form.firstName}
                  onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                  required
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-stone-600">Last name</span>
                <input
                  value={form.lastName}
                  onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                  required
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-stone-600">Father name</span>
                <input
                  value={form.fatherName}
                  onChange={(event) => setForm({ ...form, fatherName: event.target.value })}
                  required
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-stone-600">House number</span>
                <input
                  value={form.address.houseNumber}
                  onChange={(event) =>
                    setForm({ ...form, address: { ...form.address, houseNumber: event.target.value } })
                  }
                  required
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-stone-600">City</span>
                <input
                  value={form.address.city}
                  onChange={(event) =>
                    setForm({ ...form, address: { ...form.address, city: event.target.value } })
                  }
                  required
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-stone-600">State</span>
                <input
                  value={form.address.state}
                  onChange={(event) =>
                    setForm({ ...form, address: { ...form.address, state: event.target.value } })
                  }
                  required
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-stone-600">Country</span>
                <input
                  value={form.address.country}
                  onChange={(event) =>
                    setForm({ ...form, address: { ...form.address, country: event.target.value } })
                  }
                  required
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-stone-600">Pincode</span>
                <input
                  type="number"
                  value={form.address.pincode}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      address: {
                        ...form.address,
                        pincode: event.target.value === '' ? '' : Number(event.target.value),
                      },
                    })
                  }
                  required
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                />
              </label>

              <div className="col-span-full mt-2 rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
                <p className="text-sm font-medium text-stone-700">Primary donation</p>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <label className="block">
                    <span className="mb-2 block text-sm text-stone-600">Amount</span>
                    <input
                      type="number"
                      min="1"
                      value={form.donation[0]?.amount ?? ''}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          donation: [
                            {
                              ...form.donation[0],
                              amount: event.target.value === '' ? '' : Number(event.target.value),
                            },
                          ],
                        })
                      }
                      required
                      className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-stone-600">Donation type</span>
                    <select
                      value={form.donation[0]?.donationType ?? 'CASH'}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          donation: [
                            {
                              ...form.donation[0],
                              donationType: event.target.value as DonationType,
                            },
                          ],
                        })
                      }
                      className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
                    >
                      {donationTypes.map((item) => (
                        <option key={item} value={item}>
                          {titleize(item)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-stone-600">Receipt number</span>
                    <input
                      value={form.donation[0]?.receiptNumber ?? ''}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          donation: [
                            {
                              ...form.donation[0],
                              receiptNumber: event.target.value,
                            },
                          ],
                        })
                      }
                      required
                      className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
                    />
                  </label>
                </div>
              </div>

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
                  {isSaving ? 'Saving...' : 'Create devotee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
