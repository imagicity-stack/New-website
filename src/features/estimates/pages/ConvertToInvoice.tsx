import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRepository } from '../../../lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';
import { toast } from 'sonner';

export const ConvertToInvoicePage = () => {
  const { estimateId } = useParams();
  const repo = useRepository();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const estimateQuery = useQuery(['estimate', estimateId], () => repo.estimates.get(estimateId!), {
    enabled: Boolean(estimateId),
  });

  if (estimateQuery.isLoading || !estimateQuery.data) {
    return <Skeleton className="h-64 rounded-3xl" />;
  }

  const convert = async () => {
    if (!estimateId) return;
    const invoice = await repo.estimates.convertToInvoice(estimateId);
    toast.success('Estimate converted to invoice');
    await queryClient.invalidateQueries(['invoices']);
    navigate(`/invoices/${invoice.id}`);
  };

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Convert estimate</CardTitle>
        <CardDescription>Ready to lock in the work? Convert and send the invoice.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Estimate <strong>{estimateQuery.data.number}</strong> for client {estimateQuery.data.clientId} will be transformed into a draft invoice. You can
          review and send after conversion.
        </p>
        <Button onClick={convert}>Convert to invoice</Button>
      </CardContent>
    </Card>
  );
};
