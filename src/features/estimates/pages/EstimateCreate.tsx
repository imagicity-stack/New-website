import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRepository } from '../../../lib/api/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, Input, Textarea, Select } from '../../../components/ui/form';
import { calculateInvoiceTotals } from '../../invoices/utils';
import { toast } from 'sonner';

const lineItemSchema = z.object({
  description: z.string().min(2),
  qty: z.number(),
  unitPrice: z.number(),
});

const schema = z.object({
  clientId: z.string().min(1),
  date: z.string(),
  lineItems: z.array(lineItemSchema).min(1),
  notes: z.string().optional(),
});

export const EstimateCreatePage = () => {
  const repo = useRepository();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clientsQuery = useQuery(['clients'], () => repo.clients.list());

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      clientId: '',
      date: dayjs().format('YYYY-MM-DD'),
      lineItems: [{ description: '', qty: 1, unitPrice: 0 }],
      notes: 'Valid for 30 days.',
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'lineItems' });

  const onSubmit = form.handleSubmit(async (values) => {
    const totals = calculateInvoiceTotals(
      values.lineItems.map((item) => ({ ...item, discountType: null, discountValue: 0, taxRate: 0, cgst: 0, sgst: 0, igst: 0 })),
      { shipping: 0, rounding: 0 },
    );
    await repo.estimates.create({
      clientId: values.clientId,
      date: values.date,
      status: 'draft',
      lineItems: values.lineItems,
      subtotal: totals.subtotal,
      taxTotal: totals.taxTotal,
      grandTotal: totals.grandTotal,
      currency: 'INR',
      notes: values.notes,
    });
    toast.success('Estimate created');
    await queryClient.invalidateQueries(['estimates']);
    navigate('/estimates');
  });

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Create estimate</CardTitle>
        <CardDescription>Send a polished estimate before invoicing.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6" onSubmit={onSubmit}>
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <FormControl>
                    <Select value={field.value} onChange={(event) => field.onChange(event.target.value)}>
                      <option value="">Select client</option>
                      {(clientsQuery.data?.data ?? []).map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.displayName}
                        </option>
                      ))}
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
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="grid gap-3 rounded-2xl bg-white/70 p-4 shadow-sm dark:bg-slate-900/60 md:grid-cols-3">
                  <Input {...form.register(`lineItems.${index}.description`)} placeholder="Description" defaultValue={field.description} />
                  <Input type="number" {...form.register(`lineItems.${index}.qty`, { valueAsNumber: true })} defaultValue={field.qty} />
                  <Input type="number" step="0.01" {...form.register(`lineItems.${index}.unitPrice`, { valueAsNumber: true })} defaultValue={field.unitPrice} />
                  <Button type="button" variant="ghost" onClick={() => remove(index)}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => append({ description: '', qty: 1, unitPrice: 0 })}>
                Add item
              </Button>
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <CardFooter className="flex justify-end">
              <Button type="submit">Save estimate</Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
