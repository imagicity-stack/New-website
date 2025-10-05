import { Toaster as SonnerToaster } from 'sonner';

export const Toaster = () => (
  <SonnerToaster
    position="top-right"
    toastOptions={{
      style: {
        borderRadius: '1rem',
        background: '#0f172a',
        color: '#fff',
      },
    }}
  />
);
