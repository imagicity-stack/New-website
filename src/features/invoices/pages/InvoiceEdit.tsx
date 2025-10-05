import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, Input, Select, Textarea } from '../../../components/ui/form';
import { Button } from '../../../components/ui/button';
import { useRepository } from '../../../lib/api/client';
import { ItemRow } from '../components/ItemRow';
import { TaxBreakdown } from '../components/TaxBreakdown';
import { Totals } from '../components/Totals';
import { PDFPreview } from '../components/PDFPreview';
import { calculateInvoiceTotals, recalcLineItem } from '../utils';
import { Invoice, InvoiceLineItem } from '../../../lib/types';
import { toast } from 'sonner';

const lineItemSchema = z.object({
  description: z.string().min(2),
  qty: z.number(),
  unitPrice: z.number(),
  discountType: z.enum(['amount', 'percent']).nullable(),
  discountValue: z.number().default(0),
  taxRate: z.number().default(18),
  cgst: z.number().optional(),
  sgst: z.number().optional(),
  igst: z.number().optional(),
});

const schema = z.object({
  number: z.string(),
  clientId: z.string(),
  placeOfSupply: z.string(),
  reverseCharge: z.boolean(),
  currency: z.string(),
  date: z.string(),
  dueDate: z.string(),
  lineItems: z.array(lineItemSchema),
  shipping: z.number().default(0),
  rounding: z.number().default(0),
  notes: z.string().optional(),
  terms: z.string().optional(),
  status: z.enum(['draft', 'sent', 'overdue', 'paid']).default('draft'),
});

export type InvoiceEditFormValues = z.infer<typeof schema>;

export const InvoiceEditPage = () => {
  const { invoiceId } = useParams();
  const repo = useRepository();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<'draft' | 'sent' | 'paid'>('draft');

  const { data: clients } = useQuery(['clients'], () => repo.clients.list());
  const { data: organization } = useQuery(['organization'], () => repo.settings.getOrganization());
  const invoiceQuery = useQuery(['invoice', invoiceId], () => repo.invoices.get(invoiceId!), {
    enabled: Boolean(invoiceId),
  });

  const form = useForm<InvoiceEditFormValues>({
    resolver: zodResolver(schema),
    defaultValues: undefined,
  });

  const { fields, append, remove, update } = useFieldArray({ control: form.control, name: 'lineItems' });

  useEffect(() => {
    if (invoiceQuery.data) {
      const invoice = invoiceQuery.data;
      form.reset({
        number: invoice.number,
        clientId: invoice.clientId,
        placeOfSupply: invoice.placeOfSupply ?? organization?.defaultPlaceOfSupply ?? '',
        reverseCharge: invoice.reverseCharge ?? false,
        currency: invoice.currency,
        date: invoice.date,
        dueDate: invoice.dueDate,
        lineItems: invoice.lineItems,
        shipping: invoice.shipping ?? 0,
        rounding: invoice.rounding ?? 0,
        notes: invoice.notes,
        terms: invoice.terms,
        status: invoice.status,
      });
      setStatus(invoice.status === 'paid' ? 'paid' : invoice.status === 'sent' ? 'sent' : 'draft');
    }
  }, [invoiceQuery.data, organization?.defaultPlaceOfSupply]);

  const clientId = form.watch('clientId');
  const placeOfSupply = form.watch('placeOfSupply');
  const lineItems = form.watch('lineItems');
  const shipping = form.watch('shipping');
  const rounding = form.watch('rounding');
  const notes = form.watch('notes');
  const terms = form.watch('terms');
  const number = form.watch('number');
  const date = form.watch('date');
  const dueDate = form.watch('dueDate');
  const currency = form.watch('currency');

  const selectedClient = useMemo(
    () => clients?.data.find((client) => client.id === clientId) ?? null,
    [clients?.data, clientId],
  );

  const interstate = useMemo(() => {
    if (!selectedClient?.stateCode || !placeOfSupply) return false;
    return selectedClient.stateCode !== placeOfSupply;
  }, [selectedClient?.stateCode, placeOfSupply]);

  const totals = calculateInvoiceTotals(lineItems ?? [], { shipping: shipping ?? 0, rounding: rounding ?? 0 });

  const handleItemUpdate = (index: number, partial: Partial<InvoiceLineItem>) => {
    const current = form.getValues(`lineItems.${index}`);
    const merged = { ...current, ...partial } as InvoiceLineItem;
    const recalculated = recalcLineItem(merged, interstate);
    update(index, recalculated);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!invoiceId) return;
    const payload: Partial<Invoice> = {
      ...values,
      status,
      subtotal: totals.subtotal,
      discountTotal: totals.discountTotal,
      taxTotal: totals.taxTotal,
      shipping: totals.shipping,
      rounding: totals.rounding,
      grandTotal: totals.grandTotal,
    };
    const updated = await repo.invoices.update(invoiceId, payload);
    if (status === 'sent') {
      await repo.invoices.send(invoiceId);
    }
    if (status === 'paid') {
      await repo.invoices.recordPayment(invoiceId, {
        id: '',
        invoiceId,
        method: 'Manual',
        amount: totals.grandTotal,
        date: dayjs().format('YYYY-MM-DD'),
        reference: 'Manual reconciliation',
      });
    }
    toast.success('Invoice updated');
    await queryClient.invalidateQueries(['invoice', invoiceId]);
    await queryClient.invalidateQueries(['invoices']);
    navigate(`/invoices/${invoiceId}`);
    return updated;
  });

  if (invoiceQuery.isLoading || !invoiceQuery.data) {
    return <Card className="h-72 animate-pulse" />;
  }

  const previewInvoice: Invoice = {
    id: invoiceQuery.data.id,
    number: number,
    clientId,
    status,
    date,
    dueDate,
    lineItems: lineItems ?? [],
    placeOfSupply,
    reverseCharge: form.watch('reverseCharge'),
    notes,
    terms,
    subtotal: totals.subtotal,
    discountTotal: totals.discountTotal,
    taxTotal: totals.taxTotal,
    shipping: totals.shipping,
    rounding: totals.rounding,
    grandTotal: totals.grandTotal,
    currency,
    attachments: invoiceQuery.data.attachments,
    createdAt: invoiceQuery.data.createdAt,
    updatedAt: new Date().toISOString(),
  } as Invoice;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit invoice</CardTitle>
          <CardDescription>Update line items, taxes, and statuses with live totals.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-8">
              <section className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <FormControl>
                        <Select value={field.value} onChange={(event) => field.onChange(event.target.value)}>
                          <option value="">Select client</option>
                          {(clients?.data ?? []).map((client) => (
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
                  name="placeOfSupply"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Place of supply</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reverseCharge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reverse charge</FormLabel>
                      <FormControl>
                        <Select value={String(field.value)} onChange={(event) => field.onChange(event.target.value === 'true')}>
                          <option value="false">No</option>
                          <option value="true">Yes</option>
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
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </section>

              <section className="space-y-4">
                <header className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Line items</h3>
                    <p className="text-sm text-slate-500">Adjust amounts and taxes. Totals update instantly.</p>
                  </div>
                  <Button type="button" variant="outline" onClick={() => append({
                    description: '',
                    qty: 1,
                    unitPrice: 0,
                    discountType: 'percent',
                    discountValue: 0,
                    taxRate: 18,
                    cgst: 0,
                    sgst: 0,
                    igst: 0,
                  })}>
                    Add item
                  </Button>
                </header>
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <ItemRow
                      key={field.id}
                      index={index}
                      field={field as unknown as InvoiceLineItem}
                      register={form.register}
                      onRemove={() => remove(index)}
                      onUpdate={(values) => handleItemUpdate(index, values)}
                    />
                  ))}
                </div>
              </section>

              <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <div className="space-y-4">
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
                  <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Terms</FormLabel>
                        <FormControl>
                          <Textarea rows={4} {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="shipping"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} onChange={(event) => field.onChange(Number(event.target.value))} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rounding"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rounding</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} onChange={(event) => field.onChange(Number(event.target.value))} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <TaxBreakdown items={lineItems ?? []} />
                </div>
              </section>

              <Totals {...totals} />

              <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6 dark:border-slate-800">
                <div className="space-x-2">
                  <Button type="button" variant={status === 'draft' ? 'default' : 'outline'} onClick={() => setStatus('draft')}>
                    Draft
                  </Button>
                  <Button type="button" variant={status === 'sent' ? 'default' : 'outline'} onClick={() => setStatus('sent')}>
                    Save & Send
                  </Button>
                  <Button type="button" variant={status === 'paid' ? 'default' : 'outline'} onClick={() => setStatus('paid')}>
                    Mark paid
                  </Button>
                </div>
                <Button type="button" onClick={onSubmit}>
                  Update invoice
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
      {selectedClient && (
        <PDFPreview invoice={previewInvoice} client={selectedClient} organization={organization ?? null} />
      )}
    </div>
  );
};
