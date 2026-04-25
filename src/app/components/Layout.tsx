import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router';
import {
  Download,
  LayoutDashboard,
  LogOut,
  Receipt,
  Rows3,
  Trash2,
  Users,
} from 'lucide-react';
import { isAuthenticated } from '../lib/auth';
import { logout } from '../lib/api';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/devotees', label: 'Devotees', icon: Users },
  { path: '/donations', label: 'Donations', icon: Rows3 },
  { path: '/expenses', label: 'Expenses', icon: Receipt },
  { path: '/export', label: 'Excel Export', icon: Download },
  { path: '/jobs/delete-data', label: 'Delete Batch', icon: Trash2 },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 border-r border-stone-200 bg-white/90 px-6 py-8 lg:flex lg:flex-col">
          <div className="mb-8 rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 p-6 text-white shadow-lg shadow-orange-200/70">
            <p className="text-xs uppercase tracking-[0.3em] text-white/80">SLP Trust</p>
            <h1 className="mt-3 text-2xl font-semibold">Admin Workspace</h1>
            <p className="mt-2 text-sm text-white/85">
              Secure internal operations for devotees, funds, exports, and jobs.
            </p>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-lg shadow-stone-300'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 flex items-center gap-3 rounded-2xl border border-stone-200 px-4 py-3 text-stone-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </aside>

        <main className="flex-1">
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-stone-200 bg-white/90 px-5 py-4 backdrop-blur lg:hidden">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-orange-500">SLP Trust</p>
              <p className="font-semibold text-stone-900">Admin Workspace</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-700"
            >
              Logout
            </button>
          </div>
          <div className="border-b border-stone-200 bg-white px-4 py-3 lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
                      isActive
                        ? 'bg-stone-900 text-white'
                        : 'border border-stone-200 bg-stone-50 text-stone-600'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
