import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import { useRepository } from '../../../lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, Input, Select } from '../../../components/ui/form';
import { toast } from 'sonner';

const schema = z.object({
  invoiceId: z.string().min(1),
  method: z.string().min(1),
  amount: z.number().min(0.01),
  date: z.string().min(1),
  reference: z.string().optional(),
});

type RecordPaymentForm = z.infer<typeof schema>;

export const RecordPaymentPage = () => {
  const { invoiceId } = useParams();
  const repo = useRepository();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const invoicesQuery = useQuery(['invoices'], () => repo.invoices.list());

  const form = useForm<RecordPaymentForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      invoiceId: invoiceId ?? '',
      method: 'UPI',
      amount: 0,
      date: dayjs().format('YYYY-MM-DD'),
      reference: '',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await repo.invoices.recordPayment(values.invoiceId, {
      id: '',
      invoiceId: values.invoiceId,
      method: values.method,
      amount: values.amount,
      date: values.date,
      reference: values.reference,
    });
    toast.success('Payment recorded');
    await queryClient.invalidateQueries(['payments']);
    await queryClient.invalidateQueries(['invoices']);
    navigate('/payments');
  });

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Record payment</CardTitle>
        <CardDescription>Capture received payments to keep receivables up to date.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={onSubmit}>
            <FormField
              control={form.control}
              name="invoiceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice</FormLabel>
                  <FormControl>
                    <Select value={field.value} onChange={(event) => field.onChange(event.target.value)}>
                      <option value="">Select invoice</option>
                      {(invoicesQuery.data?.data ?? []).map((invoice) => (
                        <option key={invoice.id} value={invoice.id}>
                          {invoice.number}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} onChange={(event) => field.onChange(Number(event.target.value))} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Method</FormLabel>
                  <FormControl>
                    <Select value={field.value} onChange={(event) => field.onChange(event.target.value)}>
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank transfer</option>
                      <option value="Cash">Cash</option>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit">Save payment</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
