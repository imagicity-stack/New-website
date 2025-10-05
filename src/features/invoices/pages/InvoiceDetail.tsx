import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useRepository } from '../../../lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';
import { formatInr } from '../../../lib/utils/currency';
import dayjs from 'dayjs';
import { Badge } from '../../../components/ui/badge';
import { PDFPreview } from '../components/PDFPreview';

export const InvoiceDetailPage = () => {
  const { invoiceId } = useParams();
  const repo = useRepository();
  const navigate = useNavigate();
  const invoiceQuery = useQuery(['invoice', invoiceId], () => repo.invoices.get(invoiceId!), { enabled: Boolean(invoiceId) });
  const clientsQuery = useQuery(['clients'], () => repo.clients.list());
  const organizationQuery = useQuery(['organization'], () => repo.settings.getOrganization());

  if (invoiceQuery.isLoading || !invoiceQuery.data || clientsQuery.isLoading) {
    return <Skeleton className="h-72 rounded-3xl" />;
  }

  const invoice = invoiceQuery.data;
  const client = clientsQuery.data?.data.find((c) => c.id === invoice.clientId);

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>{invoice.number}</CardTitle>
              <CardDescription>
                Issued {dayjs(invoice.date).format('DD MMM YYYY')} • Due {dayjs(invoice.dueDate).format('DD MMM YYYY')}
              </CardDescription>
            </div>
            <Badge>{invoice.status}</Badge>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Bill to</h3>
              <p>{client?.displayName}</p>
              <p>{client?.billingAddress}</p>
              <p>GSTIN: {client?.gstin ?? 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Amount</h3>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">{formatInr(invoice.grandTotal)}</p>
              <p className="text-xs text-slate-400">Subtotal {formatInr(invoice.subtotal)} • Tax {formatInr(invoice.taxTotal)}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notes</h3>
              <p>{invoice.notes}</p>
            </div>
          </CardContent>
        </Card>
        {client && (
          <PDFPreview invoice={invoice} client={client} organization={organizationQuery.data ?? null} />
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full" onClick={() => navigate(`/invoices/${invoice.id}/edit`)}>
            Edit invoice
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/invoices')}>
            Back to list
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
