import { Suspense } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-stone-100 px-6 text-stone-500">
          Loading SLP Trust...
        </div>
      }
    >
      <RouterProvider router={router} />
    </Suspense>
  );
}
