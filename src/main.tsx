import './index.css';
import '@radix-ui/themes/styles.css';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AppRouter } from './app/router';
import { queryClient } from './app/queryClient';
import { ThemeProvider } from './store/theme';
import { Toaster } from './components/ui/toaster';
import { RepositoryProvider } from './lib/api/client';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <RepositoryProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={AppRouter} />
          <Toaster />
        </QueryClientProvider>
      </RepositoryProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
