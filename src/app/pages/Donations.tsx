import { Trash2 } from 'lucide-react';
import { PagedTableNavigation } from '../components/PagedTableNavigation';
import { usePagedResource } from '../hooks/usePagedResource';
import { deleteDonation, fetchDonations } from '../lib/api';
import { toErrorMessage } from '../lib/errors';
import { ACCESS_DENIED_MESSAGE, isAdminUser } from '../lib/auth';
import { formatCurrency, formatDate, titleize } from '../lib/format';
import type { DonationRecordDto } from '../types';

const PAGE_SIZE = 20;

export function Donations() {
  const {
    items: donations,
    currentPage,
    totalPages,
    totalElements,
    error,
    isLoading,
    setCurrentPage,
    setError,
    loadPage: loadData,
  } = usePagedResource<DonationRecordDto>({
    pageSize: PAGE_SIZE,
    errorMessage: 'Failed to load donations',
    loader: fetchDonations,
  });

  async function handleDelete(donationId?: number) {
    if (!isAdminUser()) {
      setError(ACCESS_DENIED_MESSAGE);
      return;
    }
    if (!donationId || !window.confirm('Delete this donation?')) {
      return;
    }
    try {
      await deleteDonation(donationId);
      await loadData();
    } catch (err) {
      setError(toErrorMessage(err, 'Failed to delete donation'));
    }
  }

  const totalDonations = donations.reduce((sum, donation) => sum + Number(donation.amount || 0), 0);

  return (
    <div className="p-5 sm:p-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-orange-500">Transactions</p>
          <h1 className="mt-3 text-3xl font-semibold text-stone-900">Donations</h1>
          <p className="mt-2 text-sm text-stone-500">
            Donation history for SLP Trust. Records are created from the devotee flow and can only be viewed or deleted here.
          </p>
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mb-6 rounded-[1.75rem] bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-white shadow-lg shadow-emerald-200/60">
        <p className="text-sm text-white/80">Current page total</p>
        <p className="mt-3 text-3xl font-semibold">{formatCurrency(totalDonations)}</p>
        <p className="mt-2 text-sm text-white/80">{totalElements} donation records overall</p>
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-stone-50">
              <tr className="text-left text-xs uppercase tracking-[0.2em] text-stone-500">
                <th className="px-6 py-4">Receipt</th>
                <th className="px-6 py-4">Devotee</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Delete</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((donation) => (
                <tr key={donation.id} className="border-t border-stone-100">
                  <td className="px-6 py-5 font-mono text-sm text-stone-600">{donation.receiptNumber}</td>
                  <td className="px-6 py-5 font-medium text-stone-900">
                    {donation.devoteeName || 'Unknown devotee'}
                  </td>
                  <td className="px-6 py-5 text-sm text-stone-600">{titleize(donation.donationType)}</td>
                  <td className="px-6 py-5 text-sm text-stone-600">{formatDate(donation.createdOn)}</td>
                  <td className="px-6 py-5 font-semibold text-emerald-600">
                    {formatCurrency(Number(donation.amount || 0))}
                  </td>
                  <td className="px-6 py-5">
                    <button
                      type="button"
                      onClick={() => handleDelete(donation.id)}
                      className="rounded-xl border border-stone-200 p-2 text-stone-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isLoading && donations.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-stone-500">No donations found.</div>
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
    </div>
  );
}
