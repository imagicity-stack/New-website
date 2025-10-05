import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useRepository } from '../../../lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { DataTable } from '../../../components/ui/data-table';
import dayjs from 'dayjs';
import { formatInr } from '../../../lib/utils/currency';

export const PaymentsListPage = () => {
  const repo = useRepository();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(['payments'], () => repo.payments.list());

  if (isLoading) {
    return <Card className="h-64 animate-pulse" />;
  }

  const payments = data?.data ?? [];

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>Payments</CardTitle>
          <CardDescription>Reconcile payments received against invoices.</CardDescription>
        </div>
        <Button onClick={() => navigate('/payments/record')}>Record payment</Button>
      </CardHeader>
      <CardContent>
        <DataTable
          data={payments}
          columns={[
            { key: 'invoiceId', header: 'Invoice' },
            {
              key: 'amount',
              header: 'Amount',
              accessor: (row) => formatInr(row.amount),
            },
            {
              key: 'date',
              header: 'Date',
              accessor: (row) => dayjs(row.date).format('DD MMM YYYY'),
            },
            { key: 'method', header: 'Method' },
            { key: 'reference', header: 'Reference' },
          ]}
        />
      </CardContent>
    </Card>
  );
};
