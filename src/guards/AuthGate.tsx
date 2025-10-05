import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { DemoModeBanner } from '../components/common/DemoModeBanner';

export const AuthGate = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { isAuthenticated, hydrateFromStorage, status } = useAuth();

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      navigate('/auth/login');
    }
  }, [status, navigate]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
        <span className="animate-pulse text-lg">Imagicity Invoicing is spinning up…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <DemoModeBanner />
      {children}
    </>
  );
};
