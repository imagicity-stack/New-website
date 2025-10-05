import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { DataTable } from '../../../components/ui/data-table';
import { useRepository } from '../../../lib/api/client';
import { formatInr } from '../../../lib/utils/currency';
import { EmptyState } from '../../../components/common/EmptyState';
import { FileText } from 'lucide-react';
import dayjs from 'dayjs';

const statuses = ['all', 'draft', 'sent', 'overdue', 'paid'] as const;

type InvoiceStatusFilter = (typeof statuses)[number];

export const InvoicesListPage = () => {
  const repo = useRepository();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const status = (params.get('status') ?? 'all') as InvoiceStatusFilter;

  const { data, isLoading } = useQuery(['invoices'], () => repo.invoices.list());

  const invoices = useMemo(() => {
    const all = data?.data ?? [];
    if (status === 'overdue') {
      return all.filter((invoice) => dayjs(invoice.dueDate).isBefore(dayjs()) && invoice.status !== 'paid');
    }
    if (status === 'all') return all;
    if (status === 'paid') return all.filter((invoice) => invoice.status === 'paid');
    return all.filter((invoice) => invoice.status === status);
  }, [data?.data, status]);

  const onStatusChange = (value: string) => {
    setParams(value === 'all' ? {} : { status: value });
  };

  return (
    <div className="space-y-6">
      <Card className="border-dashed border-brand/10 bg-brand/5">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Filter by lifecycle stage and action invoices swiftly.</CardDescription>
          </div>
          <Button onClick={() => navigate('/invoices/new')}>New invoice</Button>
        </CardHeader>
      </Card>
      <Tabs value={status} onValueChange={onStatusChange}>
        <TabsList>
          {statuses.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={status} className="mt-6">
          {isLoading ? (
            <Card className="h-72 animate-pulse" />
          ) : invoices.length === 0 ? (
            <EmptyState
              title="No invoices"
              description="Create an invoice to get started. Demo mode includes a sample draft with Indian tax splits."
              actionLabel="Create invoice"
              onAction={() => navigate('/invoices/new')}
              icon={<FileText className="h-6 w-6" />}
            />
          ) : (
            <Card>
              <CardContent>
                <DataTable
                  data={invoices}
                  columns={[
                    { key: 'number', header: 'Number' },
                    {
                      key: 'date',
                      header: 'Date',
                      accessor: (invoice) => dayjs(invoice.date).format('DD MMM YYYY'),
                    },
                    {
                      key: 'status',
                      header: 'Status',
                      accessor: (invoice) => (
                        <span className="rounded-full bg-slate-900/90 px-3 py-1 text-xs uppercase tracking-wide text-white">
                          {invoice.status}
                        </span>
                      ),
                    },
                    {
                      key: 'grandTotal',
                      header: 'Amount',
                      accessor: (invoice) => formatInr(invoice.grandTotal),
                    },
                  ]}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
