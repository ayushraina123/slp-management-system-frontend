import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { login } from '../lib/api';
import { isAuthenticated } from '../lib/auth';

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login({ username, password });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.25),_transparent_35%),linear-gradient(135deg,_#fff7ed,_#fafaf9_55%,_#f5f5f4)] px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-2xl shadow-orange-200/50 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden bg-gradient-to-br from-stone-900 via-stone-800 to-orange-900 p-12 text-white lg:block">
          <p className="text-sm uppercase tracking-[0.35em] text-orange-300">SLP Trust</p>
          <h1 className="mt-6 text-5xl font-semibold leading-tight">
            Internal access for the SLP Trust workspace.
          </h1>
          <p className="mt-6 max-w-md text-base text-orange-50/80">
            Sign in to manage devotees, donations, expenses, exports, and batch jobs from one admin workspace.
          </p>
        </section>

        <section className="p-8 sm:p-12">
          <p className="text-sm uppercase tracking-[0.3em] text-orange-600">Welcome Back</p>
          <h2 className="mt-3 text-3xl font-semibold text-stone-900">Login</h2>
          <p className="mt-2 text-sm text-stone-500">Use your account credentials to access SLP Trust.</p>

          <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm text-stone-600">Username</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white"
                placeholder="Ayush"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-stone-600">Password</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                required
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white"
                placeholder="Enter password"
              />
            </label>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-stone-900 px-4 py-3 text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-sm text-stone-500">
            Need an account?{' '}
            <Link className="font-medium text-orange-600 hover:text-orange-700" to="/signup">
              Create one
            </Link>
          </p>

          <p className="mt-10 text-center text-sm text-stone-400">
            Made by: Ayush Raina, Rajesh Raina
          </p>
        </section>
      </div>
    </div>
  );
}
