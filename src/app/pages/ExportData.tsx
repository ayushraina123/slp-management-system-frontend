import { useState, type FormEvent } from 'react';
import { triggerExport } from '../lib/api';
import { ACCESS_DENIED_MESSAGE, isAdminUser } from '../lib/auth';
import type { DonationType } from '../types';

const donationTypes: DonationType[] = ['ONLINE_UPI', 'CASH', 'CHEQUE', 'OTHER_ONLINE_SERVICE'];

export function ExportData() {
  const [donationType, setDonationType] = useState<DonationType>('ONLINE_UPI');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleExport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAdminUser()) {
      setError(ACCESS_DENIED_MESSAGE);
      setMessage('');
      return;
    }
    setMessage('');
    setError('');
    setIsSubmitting(true);
    try {
      setMessage(await triggerExport(donationType));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-5 sm:p-8">
      <div className="max-w-3xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-500">Batch Export</p>
        <h1 className="mt-3 text-3xl font-semibold text-stone-900">Excel export</h1>
        <p className="mt-2 text-sm text-stone-500">
          Trigger the Spring Batch export job for a specific donation type.
        </p>

        <form className="mt-8 space-y-6" onSubmit={handleExport}>
          <label className="block">
            <span className="mb-2 block text-sm text-stone-600">Donation type</span>
            <select
              value={donationType}
              onChange={(event) => setDonationType(event.target.value as DonationType)}
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white"
            >
              {donationTypes.map((item) => (
                <option key={item} value={item}>
                  {item.split('_').join(' ')}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-stone-900 px-5 py-3 text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Triggering export...' : 'Trigger export job'}
          </button>
        </form>

        {message ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  );
}
