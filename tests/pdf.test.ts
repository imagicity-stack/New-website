import { describe, expect, it } from 'vitest';
import { makeInvoicePdf } from '../src/lib/pdf/makeInvoicePdf';
import { Invoice, Client, OrganizationSettings } from '../src/lib/types';
import dayjs from 'dayjs';

const invoice: Invoice = {
  id: 'test',
  number: 'IMAGI240001',
  date: dayjs().format('YYYY-MM-DD'),
  dueDate: dayjs().add(7, 'day').format('YYYY-MM-DD'),
  status: 'draft',
  clientId: 'client-1',
  lineItems: [
    {
      description: 'Design retainer',
      qty: 1,
      unitPrice: 1000,
      discountType: null,
      discountValue: 0,
      taxRate: 18,
      cgst: 90,
      sgst: 90,
      igst: 0,
    },
  ],
  placeOfSupply: '29',
  reverseCharge: false,
  notes: 'Thank you!',
  terms: 'Net 7',
  subtotal: 1000,
  discountTotal: 0,
  taxTotal: 180,
  shipping: 0,
  rounding: 0,
  grandTotal: 1180,
  attachments: [],
  currency: 'INR',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const client: Client = {
  id: 'client-1',
  displayName: 'Demo Client',
  legalName: 'Demo Client Pvt Ltd',
  billingAddress: 'Bengaluru',
  shippingAddress: 'Bengaluru',
  email: 'client@example.in',
  phone: '+91 99999 99999',
  gstin: '29ABCDE1234F1Z5',
  stateCode: '29',
  notes: '',
  tags: [],
  archived: false,
};

const organization: OrganizationSettings = {
  id: 'org',
  legalName: 'Imagicity Creative Studio',
  defaultPlaceOfSupply: '29',
};

describe('invoice pdf', () => {
  it('renders the organization name in the PDF header', async () => {
    const pdfBytes = await makeInvoicePdf({ invoice, client, organization });
    const text = new TextDecoder().decode(pdfBytes.slice(0, 200));
    expect(text).toContain('Imagicity');
  });
});
