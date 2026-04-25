import { useState, type FormEvent } from 'react';
import { triggerDeleteBatch } from '../lib/api';
import { ACCESS_DENIED_MESSAGE, isAdminUser } from '../lib/auth';

export function DeleteDataJob() {
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleDelete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAdminUser()) {
      setError(ACCESS_DENIED_MESSAGE);
      setMessage('');
      return;
    }
    if (confirmation !== 'DELETE') {
      setError('Type DELETE to confirm the batch job.');
      return;
    }

    setError('');
    setMessage('');
    setIsSubmitting(true);
    try {
      setMessage(await triggerDeleteBatch());
      setConfirmation('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Batch job failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-5 sm:p-8">
      <div className="max-w-3xl rounded-[2rem] border border-red-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-red-500">Danger Zone</p>
        <h1 className="mt-3 text-3xl font-semibold text-stone-900">Delete batch job</h1>
        <p className="mt-2 text-sm text-stone-500">
          This triggers the backend `deleteDataJob` batch and removes address, devotee, donation, and expense data.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleDelete}>
          <label className="block">
            <span className="mb-2 block text-sm text-stone-600">Confirmation</span>
            <input
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-red-400 focus:bg-white"
              placeholder="Type DELETE"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-red-600 px-5 py-3 text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Triggering delete job...' : 'Trigger delete job'}
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
