import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useRepository } from '../../../lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { formatInr } from '../../../lib/utils/currency';

export const ClientDetailPage = () => {
  const params = useParams();
  const repo = useRepository();
  const clientQuery = useQuery(['client', params.clientId], () => repo.clients.get(params.clientId!), {
    enabled: Boolean(params.clientId),
  });
  const invoicesQuery = useQuery(['client-invoices', params.clientId], () => repo.invoices.list(), {
    enabled: Boolean(params.clientId),
  });

  if (clientQuery.isLoading || !clientQuery.data) {
    return <Skeleton className="h-72 rounded-3xl" />;
  }

  const client = clientQuery.data;
  const invoices = (invoicesQuery.data?.data ?? []).filter((invoice) => invoice.clientId === client.id);
  const totalBilled = invoices.reduce((acc, invoice) => acc + invoice.grandTotal, 0);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{client.displayName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p><strong>Legal name:</strong> {client.legalName}</p>
          <p><strong>Email:</strong> {client.email ?? '—'}</p>
          <p><strong>Phone:</strong> {client.phone ?? '—'}</p>
          <p><strong>GSTIN:</strong> {client.gstin ?? '—'}</p>
          <p><strong>Billing:</strong> {client.billingAddress ?? '—'}</p>
          <p><strong>Shipping:</strong> {client.shippingAddress ?? '—'}</p>
          <div className="flex flex-wrap gap-2">
            {(client.tags ?? []).map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Financials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p><strong>Total billed:</strong> {formatInr(totalBilled)}</p>
          <ul className="space-y-2">
            {invoices.map((invoice) => (
              <li key={invoice.id} className="flex items-center justify-between rounded-2xl bg-slate-100/60 px-4 py-3 dark:bg-slate-800/70">
                <span>{invoice.number}</span>
                <Badge className="bg-slate-900 text-white">{invoice.status}</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
