import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useRepository } from '../../../lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { DataTable } from '../../../components/ui/data-table';
import dayjs from 'dayjs';
import { formatInr } from '../../../lib/utils/currency';

export const EstimatesListPage = () => {
  const repo = useRepository();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(['estimates'], () => repo.estimates.list());

  if (isLoading) {
    return <Card className="h-64 animate-pulse" />;
  }

  const estimates = data?.data ?? [];

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>Estimates</CardTitle>
          <CardDescription>Create and convert estimates to invoices.</CardDescription>
        </div>
        <Button onClick={() => navigate('/estimates/new')}>New estimate</Button>
      </CardHeader>
      <CardContent>
        <DataTable
          data={estimates}
          columns={[
            { key: 'number', header: 'Number' },
            {
              key: 'date',
              header: 'Date',
              accessor: (estimate) => dayjs(estimate.date).format('DD MMM YYYY'),
            },
            { key: 'status', header: 'Status' },
            {
              key: 'grandTotal',
              header: 'Amount',
              accessor: (estimate) => formatInr(estimate.grandTotal),
            },
          ]}
        />
      </CardContent>
    </Card>
  );
};
