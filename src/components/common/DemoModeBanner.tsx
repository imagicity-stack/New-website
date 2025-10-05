import { AlertCircle } from 'lucide-react';
import { useRepository } from '../../lib/api/client';

export const DemoModeBanner = () => {
  const repo = useRepository();
  if (repo.mode !== 'indexeddb') return null;
  return (
    <div className="flex items-center justify-center bg-amber-500/10 px-4 py-3 text-sm text-amber-600">
      <AlertCircle className="mr-2 h-4 w-4" /> You are exploring Imagicity Invoicing in demo mode. Data lives in
      your browser. Export or import backups from Settings.
    </div>
  );
};
