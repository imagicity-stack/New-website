import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useRepository } from '../../../lib/api/client';
import { Button } from '../../../components/ui/button';
import { DataTable } from '../../../components/ui/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { EmptyState } from '../../../components/common/EmptyState';
import { Users } from 'lucide-react';
import { Skeleton } from '../../../components/ui/skeleton';
import { motion } from 'framer-motion';
import { Kbd } from '../../../components/common/Kbd';

export const ClientsListPage = () => {
  const repo = useRepository();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(['clients'], () => repo.clients.list());

  if (isLoading) {
    return <Skeleton className="h-64 rounded-3xl" />;
  }

  const clients = data?.data ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="border-dashed border-brand/10 bg-brand/5">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Clients
            <Button onClick={() => navigate('/clients/new')}>
              New client <Kbd>⌘</Kbd>
            </Button>
          </CardTitle>
          <CardDescription>
            Manage billing and shipping addresses, GSTINs, and custom tags. Quick create with shortcut <Kbd>C</Kbd>.
          </CardDescription>
        </CardHeader>
      </Card>
      {clients.length === 0 ? (
        <EmptyState
          title="No clients yet"
          description="Start by adding your first client. We’ll store GST details and addresses for rapid invoicing."
          actionLabel="Add client"
          onAction={() => navigate('/clients/new')}
          icon={<Users className="h-6 w-6" />}
        />
      ) : (
        <Card>
          <CardContent>
            <DataTable
              data={clients}
              columns={[
                { key: 'displayName', header: 'Display name' },
                { key: 'email', header: 'Email' },
                { key: 'phone', header: 'Phone' },
                { key: 'gstin', header: 'GSTIN' },
                {
                  key: 'stateCode',
                  header: 'State',
                  accessor: (row) => <span className="text-xs uppercase text-slate-500">{row.stateCode ?? '--'}</span>,
                },
              ]}
              onPageChange={() => undefined}
            />
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};
