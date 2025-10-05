import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useRepository } from '../../../lib/api/client';
import { Button } from '../../../components/ui/button';
import { DataTable } from '../../../components/ui/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { EmptyState } from '../../../components/common/EmptyState';
import { ClipboardList } from 'lucide-react';
import { formatInr } from '../../../lib/utils/currency';

export const ItemsListPage = () => {
  const repo = useRepository();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(['items'], () => repo.items.list());

  if (isLoading) {
    return <Card className="h-72 animate-pulse" />;
  }

  const items = data?.data ?? [];

  return (
    <div className="space-y-6">
      <Card className="border-dashed border-brand/10 bg-brand/5">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Catalogue</CardTitle>
            <CardDescription>Maintain services, goods, HSN/SAC codes, and pricing.</CardDescription>
          </div>
          <Button onClick={() => navigate('/items/new')}>New item</Button>
        </CardHeader>
      </Card>
      {items.length === 0 ? (
        <EmptyState
          title="No items"
          description="Set up billable services or products with tax preferences to move faster when invoicing."
          actionLabel="Add item"
          onAction={() => navigate('/items/new')}
          icon={<ClipboardList className="h-6 w-6" />}
        />
      ) : (
        <Card>
          <CardContent>
            <DataTable
              data={items}
              columns={[
                { key: 'name', header: 'Name' },
                { key: 'hsnOrSac', header: 'HSN/SAC' },
                { key: 'unit', header: 'Unit' },
                {
                  key: 'price',
                  header: 'Price',
                  accessor: (item) => <span>{formatInr(item.price)}</span>,
                },
                { key: 'taxPreference', header: 'Tax preference' },
              ]}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
