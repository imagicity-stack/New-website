import { useEffect, useMemo, useState } from 'react';
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
import { formatInr } from '../../../lib/utils/currency';
import { Invoice, InvoiceLineItem } from '../../../lib/types';
import { toast } from 'sonner';
import { todayIso, addDays } from '../../../lib/utils/date';

const lineItemSchema = z.object({
  description: z.string().min(2),
  qty: z.number().min(0.01),
  unitPrice: z.number().min(0),
  discountType: z.enum(['amount', 'percent']).nullable().default('percent'),
  discountValue: z.number().min(0).default(0),
  taxRate: z.number().min(0).max(28).default(18),
  cgst: z.number().optional(),
  sgst: z.number().optional(),
  igst: z.number().optional(),
});

const schema = z.object({
  number: z.string().optional(),
  clientId: z.string().min(1, 'Select a client'),
  placeOfSupply: z.string().min(1),
  reverseCharge: z.boolean().default(false),
  currency: z.string().default('INR'),
  date: z.string().default(todayIso()),
  dueDate: z.string().default(addDays(todayIso(), 7)),
  lineItems: z.array(lineItemSchema).min(1, 'Add at least one line item'),
  shipping: z.number().default(0),
  rounding: z.number().default(0),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

export type InvoiceFormValues = z.infer<typeof schema>;

const createEmptyLineItem = (): InvoiceLineItem => ({
  description: '',
  qty: 1,
  unitPrice: 0,
  discountType: 'percent',
  discountValue: 0,
  taxRate: 18,
  cgst: 0,
  sgst: 0,
  igst: 0,
});

export const InvoiceCreatePage = () => {
  const repo = useRepository();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<'draft' | 'sent' | 'paid'>('draft');

  const { data: clients } = useQuery(['clients'], () => repo.clients.list());
  const { data: items } = useQuery(['items'], () => repo.items.list());
  const { data: organization } = useQuery(['organization'], () => repo.settings.getOrganization());

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      number: '',
      clientId: '',
      placeOfSupply: '',
      reverseCharge: false,
      currency: 'INR',
      date: todayIso(),
      dueDate: addDays(todayIso(), 7),
      lineItems: [createEmptyLineItem()],
      shipping: 0,
      rounding: 0,
      notes: 'Thank you for partnering with Imagicity.',
      terms:
        'Payment due in 7 days. UPI: demo@upi. Bank: Imagicity Bank, A/C 1234567890, IFSC IMAG0000123. Late payments attract 1.5% monthly interest.',
    },
  });

  useEffect(() => {
    repo.invoices.generateNumber().then((number) => {
      form.setValue('number', number);
    });
  }, []);

  useEffect(() => {
    if (organization?.defaultPlaceOfSupply) {
      form.setValue('placeOfSupply', organization.defaultPlaceOfSupply);
    }
  }, [organization?.defaultPlaceOfSupply]);

  const { fields, append, remove, update } = useFieldArray({ control: form.control, name: 'lineItems' });

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

  const handleItemUpdate = (index: number, partial: Partial<InvoiceLineItem>) => {
    const current = form.getValues(`lineItems.${index}`);
    const merged = { ...current, ...partial } as InvoiceLineItem;
    const recalculated = recalcLineItem(merged, interstate);
    update(index, recalculated);
  };

  const totals = calculateInvoiceTotals(lineItems, {
    shipping,
    rounding,
  });

  const previewInvoice: Invoice = {
    id: 'preview',
    number: number ?? 'IMAGI240000',
    clientId,
    status,
    date,
    dueDate,
    lineItems,
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
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as Invoice;

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      ...values,
      status,
      subtotal: totals.subtotal,
      discountTotal: totals.discountTotal,
      taxTotal: totals.taxTotal,
      shipping: totals.shipping,
      rounding: totals.rounding,
      grandTotal: totals.grandTotal,
      currency: values.currency,
    } as Partial<Invoice>;

    const invoice = await repo.invoices.create(payload);
    if (status === 'sent') {
      await repo.invoices.send(invoice.id);
    }
    if (status === 'paid') {
      await repo.invoices.recordPayment(invoice.id, {
        id: '',
        invoiceId: invoice.id,
        method: 'Manual',
        amount: totals.grandTotal,
        date: dayjs().format('YYYY-MM-DD'),
        reference: 'Initial payment',
      });
    }
    toast.success(`Invoice ${invoice.number} saved`);
    await queryClient.invalidateQueries(['invoices']);
    navigate(`/invoices/${invoice.id}`);
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create invoice</CardTitle>
          <CardDescription>Craft an Indian GST-compliant invoice with live totals and PDF preview.</CardDescription>
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
                      <FormLabel>Place of supply (State code)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="29" />
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
                      <FormLabel>Invoice date</FormLabel>
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
                    <p className="text-sm text-slate-500">Inline edit quantities, discounts, and GST rates.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => append(createEmptyLineItem())}
                  >
                    Add item
                  </Button>
                </header>
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <ItemRow
                      key={field.id}
                      index={index}
                      field={field as InvoiceLineItem}
                      register={form.register}
                      onRemove={() => remove(index)}
                      onUpdate={(values) => handleItemUpdate(index, values)}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-4">
                  <select
                    className="flex h-11 w-full max-w-xs rounded-2xl border border-slate-300 bg-white px-4 text-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    defaultValue=""
                    onChange={(event) => {
                      const selectedItem = items?.data.find((item) => item.id === event.target.value);
                      if (selectedItem) {
                        append({
                          description: selectedItem.name,
                          qty: 1,
                          unitPrice: selectedItem.price,
                          discountType: 'percent',
                          discountValue: 0,
                          taxRate: selectedItem.taxPreference === 'exempt' ? 0 : 18,
                          cgst: 0,
                          sgst: 0,
                          igst: 0,
                        });
                        event.target.value = '';
                      }
                    }}
                  >
                    <option value="">Insert from catalogue</option>
                    {(items?.data ?? []).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} — {formatInr(item.price)}
                      </option>
                    ))}
                  </select>
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
                  <TaxBreakdown items={form.watch('lineItems')} />
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
                  Save invoice
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
