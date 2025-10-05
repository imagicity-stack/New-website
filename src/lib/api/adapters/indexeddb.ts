import Dexie, { Table } from 'dexie';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import {
  ApiModeRepository,
  Client,
  Estimate,
  Invoice,
  InvoiceLineItem,
  Item,
  NumberingConfig,
  OrganizationSettings,
  Payment,
  TaxConfig,
  UserAccount,
} from '../../types';
import { createInvoiceNumber, maybeResetNumbering, nextNumbering } from '../../utils/numbering';
import { splitGst } from '../../utils/gst';

interface MetaRow {
  key: string;
  value: unknown;
}

class ImagicityDatabase extends Dexie {
  clients!: Table<Client, string>;
  items!: Table<Item, string>;
  invoices!: Table<Invoice, string>;
  payments!: Table<Payment, string>;
  estimates!: Table<Estimate, string>;
  meta!: Table<MetaRow, string>;

  constructor() {
    super('imagicity');
    this.version(1).stores({
      clients: '&id, displayName, legalName',
      items: '&id, name',
      invoices: '&id, number, status, clientId',
      payments: '&id, invoiceId',
      estimates: '&id, number, clientId',
      meta: '&key',
    });
    this.on('populate', () => {
      void this.seed();
    });
  }

  async seed() {
    const clientId = crypto.randomUUID();
    const invoiceId = crypto.randomUUID();
    const itemOne = crypto.randomUUID();
    const itemTwo = crypto.randomUUID();
    await this.clients.add({
      id: clientId,
      displayName: 'Demo Client',
      legalName: 'Demo Client Pvt Ltd',
      email: 'billing@democlient.in',
      phone: '+91 98765 43210',
      billingAddress: '221B Residency Road, Bengaluru, KA',
      shippingAddress: '221B Residency Road, Bengaluru, KA',
      gstin: '29ABCDE1234F1Z5',
      stateCode: '29',
      notes: 'Trusted partner for all demo journeys.',
      tags: ['priority'],
    });
    await this.items.bulkAdd([
      {
        id: itemOne,
        name: 'Brand Identity Package',
        price: 45000,
        hsnOrSac: '9983',
        unit: 'service',
        taxPreference: 'exclusive',
        description: 'Visual identity exploration and delivery.',
      },
      {
        id: itemTwo,
        name: 'Product Photography Session',
        price: 12000,
        hsnOrSac: '9983',
        unit: 'session',
        taxPreference: 'exclusive',
        description: 'Half-day shoot with editing.',
      },
    ]);
    const lineItems: InvoiceLineItem[] = [
      {
        itemId: itemOne,
        description: 'Brand Identity Package',
        qty: 1,
        unitPrice: 45000,
        discountType: null,
        discountValue: 0,
        taxRate: 18,
        ...splitGst({ amount: 45000, taxRate: 18, interstate: false }),
      },
      {
        itemId: itemTwo,
        description: 'Product Photography Session',
        qty: 1,
        unitPrice: 12000,
        discountType: 'percent',
        discountValue: 10,
        taxRate: 18,
        ...splitGst({ amount: 12000 * 0.9, taxRate: 18, interstate: false }),
      },
    ];
    const subtotal = lineItems.reduce((acc, item) => acc + item.qty * item.unitPrice, 0);
    const discountTotal = lineItems.reduce((acc, item) => {
      if (item.discountType === 'percent') return acc + (item.unitPrice * (item.discountValue ?? 0) * item.qty) / 100;
      if (item.discountType === 'amount') return acc + (item.discountValue ?? 0) * item.qty;
      return acc;
    }, 0);
    const taxTotal = lineItems.reduce((acc, item) => acc + (item.cgst ?? 0) + (item.sgst ?? 0) + (item.igst ?? 0), 0);
    await this.invoices.add({
      id: invoiceId,
      number: 'IMAGI240001',
      date: dayjs().format('YYYY-MM-DD'),
      dueDate: dayjs().add(7, 'day').format('YYYY-MM-DD'),
      status: 'draft',
      clientId,
      lineItems,
      placeOfSupply: 'Karnataka',
      reverseCharge: false,
      notes: 'Thank you for trusting Imagicity for your brand vision.',
      terms:
        'Payment due within 7 days. Late payments attract 1.5% monthly interest. UPI: demo@upi. Bank: Imagicity Bank, A/C 1234567890, IFSC IMAG0000123.',
      subtotal,
      discountTotal,
      taxTotal,
      shipping: 0,
      rounding: 0,
      grandTotal: subtotal - discountTotal + taxTotal,
      attachments: [],
      currency: 'INR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await this.meta.bulkAdd([
      { key: 'organization', value: { id: 'org', legalName: 'Imagicity Creative Studio', defaultPlaceOfSupply: 'Karnataka' } },
      { key: 'numbering', value: { prefix: 'IMAGI', nextNumber: 2, resetPolicy: 'yearly' } },
      {
        key: 'tax',
        value: { defaultCgst: 9, defaultSgst: 9, defaultIgst: 18, inclusivePricing: false },
      },
      { key: 'user', value: { id: 'demo', name: 'Aditi Verma', email: 'demo@imagicity.in', role: 'owner', token: 'demo-token' } },
    ]);
  }
}

const db = new ImagicityDatabase();

const ensure = async () => {
  if (!db.isOpen()) {
    await db.open();
  }
};

const searchMatch = (value: string | undefined, search: string) =>
  value?.toLowerCase().includes(search.toLowerCase()) ?? false;

const listTable = async <T extends { id: string }>(
  table: Table<T, string>,
  params?: { page?: number; pageSize?: number; search?: string; status?: string },
) => {
  await ensure();
  let collection = table.toCollection();
  if (params?.search) {
    collection = collection.filter((record) =>
      Object.values(record).some((field) => (typeof field === 'string' ? searchMatch(field, params.search ?? '') : false)),
    );
  }
  const all = await collection.sortBy('id');
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? all.length;
  const sliced = all.slice((page - 1) * pageSize, page * pageSize);
  return { data: sliced, total: all.length };
};

const createId = () => crypto.randomUUID();

export const createIndexedDbRepository = (): ApiModeRepository => {
  const repository = {
    mode: 'indexeddb',
  } as ApiModeRepository;

  repository.clients = {
    list: (params) => listTable(db.clients, params),
    get: async (id) => {
      await ensure();
      const client = await db.clients.get(id);
      if (!client) throw new Error('Client not found');
      return client;
    },
    create: async (payload) => {
      await ensure();
      const record = { id: createId(), tags: [], ...payload } as Client;
      await db.clients.add(record);
      return record;
    },
    update: async (id, payload) => {
      await ensure();
      await db.clients.update(id, payload);
      const updated = await db.clients.get(id);
      if (!updated) throw new Error('Client not found after update');
      return updated;
    },
    remove: async (id) => {
      await ensure();
      await db.clients.delete(id);
    },
  };

  repository.items = {
    list: (params) => listTable(db.items, params),
    get: async (id) => {
      await ensure();
      const item = await db.items.get(id);
      if (!item) throw new Error('Item not found');
      return item;
    },
    create: async (payload) => {
      await ensure();
      const record = { id: createId(), ...payload } as Item;
      await db.items.add(record);
      return record;
    },
    update: async (id, payload) => {
      await ensure();
      await db.items.update(id, payload);
      const updated = await db.items.get(id);
      if (!updated) throw new Error('Item not found after update');
      return updated;
    },
    remove: async (id) => {
      await ensure();
      await db.items.delete(id);
    },
  };

  repository.invoices = {
    list: async (params) => {
      const result = await listTable(db.invoices, params);
      if (params?.status) {
        const filtered = result.data.filter((invoice) => invoice.status === params.status);
        return { data: filtered, total: filtered.length };
      }
      return result;
    },
    get: async (id) => {
      await ensure();
      const invoice = await db.invoices.get(id);
      if (!invoice) throw new Error('Invoice not found');
      return invoice;
    },
    create: async (payload) => {
      await ensure();
      const numbering = ((await db.meta.get('numbering'))?.value as NumberingConfig | undefined) ?? {
        prefix: 'IMAGI',
        nextNumber: 1,
        resetPolicy: 'yearly',
      };
      const updatedNumbering = maybeResetNumbering(numbering, payload?.date ?? null);
      const number = payload.number ?? createInvoiceNumber(updatedNumbering);
      const invoice: Invoice = {
        id: createId(),
        number,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lineItems: [],
        subtotal: 0,
        discountTotal: 0,
        taxTotal: 0,
        currency: 'INR',
        ...payload,
      } as Invoice;
      await db.invoices.add(invoice);
      await db.meta.put({ key: 'numbering', value: nextNumbering(updatedNumbering) });
      return invoice;
    },
    update: async (id, payload) => {
      await ensure();
      await db.invoices.update(id, { ...payload, updatedAt: new Date().toISOString() });
      const invoice = await db.invoices.get(id);
      if (!invoice) throw new Error('Invoice missing');
      return invoice;
    },
    remove: async (id) => {
      await ensure();
      await db.invoices.delete(id);
    },
    generateNumber: async () => {
      await ensure();
      const numbering = ((await db.meta.get('numbering'))?.value as NumberingConfig | undefined) ?? {
        prefix: 'IMAGI',
        nextNumber: 1,
        resetPolicy: 'yearly',
      };
      return createInvoiceNumber(numbering);
    },
    recordPayment: async (id, payment) => {
      await ensure();
      const invoice = await db.invoices.get(id);
      if (!invoice) throw new Error('Invoice missing');
      const record: Payment = { id: createId(), ...payment, invoiceId: id };
      await db.payments.add(record);
      const totalPayments = await db.payments
        .where('invoiceId')
        .equals(id)
        .toArray()
        .then((rows) => rows.reduce((acc, row) => acc + row.amount, 0));
      const updatedStatus = totalPayments >= invoice.grandTotal ? 'paid' : invoice.status;
      await db.invoices.update(id, { status: updatedStatus, updatedAt: new Date().toISOString() });
      const refreshed = await db.invoices.get(id);
      if (!refreshed) throw new Error('Invoice missing after payment');
      return refreshed;
    },
    send: async (id) => {
      await ensure();
      await db.invoices.update(id, { status: 'sent' });
      toast.success('Invoice marked as sent in demo mode.');
    },
  };

  repository.payments = {
    list: (params) => listTable(db.payments, params),
    get: async (id) => {
      await ensure();
      const payment = await db.payments.get(id);
      if (!payment) throw new Error('Payment missing');
      return payment;
    },
    create: async (payload) => {
      await ensure();
      const record: Payment = { id: createId(), ...payload };
      await db.payments.add(record);
      return record;
    },
    update: async (id, payload) => {
      await ensure();
      await db.payments.update(id, payload);
      const payment = await db.payments.get(id);
      if (!payment) throw new Error('Payment missing after update');
      return payment;
    },
    remove: async (id) => {
      await ensure();
      await db.payments.delete(id);
    },
  };

  repository.estimates = {
    list: (params) => listTable(db.estimates, params),
    get: async (id) => {
      await ensure();
      const estimate = await db.estimates.get(id);
      if (!estimate) throw new Error('Estimate missing');
      return estimate;
    },
    create: async (payload) => {
      await ensure();
      const estimate: Estimate = {
        id: createId(),
        status: 'draft',
        lineItems: [],
        subtotal: 0,
        taxTotal: 0,
        grandTotal: 0,
        currency: 'INR',
        ...payload,
      } as Estimate;
      await db.estimates.add(estimate);
      return estimate;
    },
    update: async (id, payload) => {
      await ensure();
      await db.estimates.update(id, payload);
      const estimate = await db.estimates.get(id);
      if (!estimate) throw new Error('Estimate missing');
      return estimate;
    },
    remove: async (id) => {
      await ensure();
      await db.estimates.delete(id);
    },
    convertToInvoice: async (id) => {
      const estimate = await db.estimates.get(id);
      if (!estimate) throw new Error('Estimate missing');
      const invoice = await repository.invoices.create({
        clientId: estimate.clientId,
        lineItems: estimate.lineItems,
        subtotal: estimate.subtotal,
        taxTotal: estimate.taxTotal,
        grandTotal: estimate.grandTotal,
        currency: estimate.currency,
        status: 'draft',
        date: dayjs().format('YYYY-MM-DD'),
        dueDate: dayjs().add(7, 'day').format('YYYY-MM-DD'),
      } as Partial<Invoice>);
      toast.success('Estimate converted to invoice.');
      return invoice;
    },
  };

  repository.auth = {
    login: async ({ email }: { email: string; password: string }) => {
      await ensure();
      const user = ((await db.meta.get('user'))?.value as UserAccount | undefined) ?? {
        id: 'demo',
        name: 'Demo Owner',
        email,
        role: 'owner',
        token: 'demo-token',
      };
      window.localStorage.setItem('imagicity-token', user.token);
      return user;
    },
    register: async ({ name, email }: { name: string; email: string; password: string }) => {
      const user: UserAccount = { id: createId(), name, email, role: 'owner', token: createId() };
      await db.meta.put({ key: 'user', value: user });
      window.localStorage.setItem('imagicity-token', user.token);
      return user;
    },
    me: async () => {
      await ensure();
      return (await db.meta.get('user'))?.value as UserAccount | null;
    },
  };

  repository.settings = {
    getOrganization: async () => {
      await ensure();
      return ((await db.meta.get('organization'))?.value as OrganizationSettings | undefined) ?? null;
    },
    updateOrganization: async (payload) => {
      await ensure();
      const existing = ((await db.meta.get('organization'))?.value as OrganizationSettings | undefined) ?? {
        id: 'org',
        legalName: 'Imagicity',
      };
      const updated = { ...existing, ...payload };
      await db.meta.put({ key: 'organization', value: updated });
      return updated;
    },
    getNumbering: async () => {
      await ensure();
      return ((await db.meta.get('numbering'))?.value as NumberingConfig | undefined) ?? {
        prefix: 'IMAGI',
        nextNumber: 1,
        resetPolicy: 'yearly',
      };
    },
    updateNumbering: async (payload) => {
      const config = await repository.settings.getNumbering();
      const updated = { ...config, ...payload };
      await db.meta.put({ key: 'numbering', value: updated });
      return updated;
    },
    getTax: async () => {
      await ensure();
      return ((await db.meta.get('tax'))?.value as TaxConfig | undefined) ?? {
        defaultCgst: 9,
        defaultSgst: 9,
        defaultIgst: 18,
        inclusivePricing: false,
      };
    },
    updateTax: async (payload) => {
      const config = await repository.settings.getTax();
      const updated = { ...config, ...payload };
      await db.meta.put({ key: 'tax', value: updated });
      return updated;
    },
    exportData: async () => {
      await ensure();
      const data = {
        clients: await db.clients.toArray(),
        items: await db.items.toArray(),
        invoices: await db.invoices.toArray(),
        payments: await db.payments.toArray(),
        estimates: await db.estimates.toArray(),
        meta: await db.meta.toArray(),
      };
      return JSON.stringify(data, null, 2);
    },
    importData: async (payload, mode) => {
      await ensure();
      const parsed = JSON.parse(payload);
      if (mode === 'replace') {
        await db.transaction('rw', db.clients, db.items, db.invoices, db.payments, db.estimates, db.meta, async () => {
          await Promise.all([
            db.clients.clear(),
            db.items.clear(),
            db.invoices.clear(),
            db.payments.clear(),
            db.estimates.clear(),
            db.meta.clear(),
          ]);
        });
      }
      await db.transaction('rw', db.clients, db.items, db.invoices, db.payments, db.estimates, db.meta, async () => {
        if (parsed.clients) await db.clients.bulkPut(parsed.clients);
        if (parsed.items) await db.items.bulkPut(parsed.items);
        if (parsed.invoices) await db.invoices.bulkPut(parsed.invoices);
        if (parsed.payments) await db.payments.bulkPut(parsed.payments);
        if (parsed.estimates) await db.estimates.bulkPut(parsed.estimates);
        if (parsed.meta) await db.meta.bulkPut(parsed.meta);
      });
    },
  };

  return repository;
};
