import { lazy, type ComponentType } from 'react';
import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';

function lazyRoute<TModule, TName extends keyof TModule & string>(
  loader: () => Promise<TModule>,
  exportName: TName,
) {
  return lazy(async () => {
    const module = await loader();
    return { default: module[exportName] as ComponentType };
  });
}

const Dashboard = lazyRoute(() => import('./pages/Dashboard'), 'Dashboard');
const Devotees = lazyRoute(() => import('./pages/Devotees'), 'Devotees');
const Donations = lazyRoute(() => import('./pages/Donations'), 'Donations');
const Expenses = lazyRoute(() => import('./pages/Expenses'), 'Expenses');
const Login = lazyRoute(() => import('./pages/Login'), 'Login');
const Signup = lazyRoute(() => import('./pages/Signup'), 'Signup');
const ExportData = lazyRoute(() => import('./pages/ExportData'), 'ExportData');
const DeleteDataJob = lazyRoute(() => import('./pages/DeleteDataJob'), 'DeleteDataJob');

export const router = createBrowserRouter([
  { path: '/login', Component: Login },
  { path: '/signup', Component: Signup },
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'devotees', Component: Devotees },
      { path: 'donations', Component: Donations },
      { path: 'expenses', Component: Expenses },
      { path: 'export', Component: ExportData },
      { path: 'jobs/delete-data', Component: DeleteDataJob },
    ],
  },
]);
