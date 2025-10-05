import { InvoiceLineItem } from '../../lib/types';
import { splitGst } from '../../lib/utils/gst';

export const recalcLineItem = (item: InvoiceLineItem, interstate: boolean) => {
  if (!item.taxRate) {
    return { ...item, cgst: 0, sgst: 0, igst: 0 };
  }
  const base = item.unitPrice * item.qty;
  const discount =
    item.discountType === 'amount'
      ? (item.discountValue ?? 0) * item.qty
      : item.discountType === 'percent'
        ? (base * (item.discountValue ?? 0)) / 100
        : 0;
  const taxable = base - discount;
  const split = splitGst({ amount: taxable, taxRate: item.taxRate, interstate });
  return { ...item, ...split };
};

export const calculateInvoiceTotals = (
  items: InvoiceLineItem[],
  options: { shipping?: number; rounding?: number },
) => {
  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.qty, 0);
  const discountTotal = items.reduce((acc, item) => {
    if (item.discountType === 'amount') return acc + (item.discountValue ?? 0) * item.qty;
    if (item.discountType === 'percent') return acc + (item.unitPrice * item.qty * (item.discountValue ?? 0)) / 100;
    return acc;
  }, 0);
  const taxTotal = items.reduce((acc, item) => acc + (item.cgst ?? 0) + (item.sgst ?? 0) + (item.igst ?? 0), 0);
  const shipping = options.shipping ?? 0;
  const rounding = options.rounding ?? 0;
  const grandTotal = subtotal - discountTotal + taxTotal + shipping + rounding;
  return { subtotal, discountTotal, taxTotal, shipping, rounding, grandTotal };
};
