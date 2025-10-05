import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRepository } from '../../../lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { formatInr } from '../../../lib/utils/currency';

const downloadCsv = (filename: string, rows: string[][]) => {
  const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const ReportsPage = () => {
  const repo = useRepository();
  const invoicesQuery = useQuery(['invoices'], () => repo.invoices.list());
  const clientsQuery = useQuery(['clients'], () => repo.clients.list());

  const salesByClient = useMemo(() => {
    const clients = clientsQuery.data?.data ?? [];
    const invoices = invoicesQuery.data?.data ?? [];
    return clients.map((client) => {
      const total = invoices
        .filter((invoice) => invoice.clientId === client.id)
        .reduce((acc, invoice) => acc + invoice.grandTotal, 0);
      return { client: client.displayName, total };
    });
  }, [clientsQuery.data?.data, invoicesQuery.data?.data]);

  const exportSalesByClient = () => {
    downloadCsv(
      'sales-by-client.csv',
      [['Client', 'Amount'], ...salesByClient.map((entry) => [entry.client, formatInr(entry.total)])],
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sales by client</CardTitle>
          <CardDescription>Total value of invoices issued per client.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {salesByClient.map((entry) => (
              <div key={entry.client} className="flex items-center justify-between gap-6">
                <span>{entry.client}</span>
                <strong>{formatInr(entry.total)}</strong>
              </div>
            ))}
          </div>
          <Button onClick={exportSalesByClient}>Export CSV</Button>
        </CardContent>
      </Card>
    </div>
  );
};
