import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { ReactErrorBoundary } from '@/components/ui/ErrorBoundary';
import { router } from './router';

const queryClient = new QueryClient();

export function App() {
  return (
    <ReactErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </ReactErrorBoundary>
  );
} 