import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { signup } from '../lib/api';
import { isAuthenticated } from '../lib/auth';

export function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Password and confirm password must match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup({ username, password });
      setSuccess('Account created. You can log in now.');
      setTimeout(() => navigate('/login', { replace: true }), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(120deg,_#fff7ed,_#fffbeb_45%,_#fafaf9)] px-4 py-10">
      <div className="w-full max-w-xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-2xl shadow-orange-100 sm:p-10">
        <p className="text-sm uppercase tracking-[0.35em] text-orange-500">SLP Trust</p>
        <h1 className="mt-3 text-3xl font-semibold text-stone-900">Create account</h1>
        <p className="mt-2 text-sm text-stone-500">
          Register a user for the SLP Trust admin workspace.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm text-stone-600">Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-stone-600">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-stone-600">Confirm Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white"
            />
          </label>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-orange-500 px-4 py-3 text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-sm text-stone-500">
          Already registered?{' '}
          <Link className="font-medium text-stone-900 hover:text-orange-600" to="/login">
            Go to login
          </Link>
        </p>
      </div>
    </div>
  );
}
