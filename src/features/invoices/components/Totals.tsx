import { formatInr } from '../../../lib/utils/currency';

interface TotalsProps {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shipping: number;
  rounding: number;
  grandTotal: number;
}

export const Totals = ({ subtotal, discountTotal, taxTotal, shipping, rounding, grandTotal }: TotalsProps) => (
  <div className="rounded-2xl bg-white/70 p-6 text-sm text-slate-600 shadow-inner dark:bg-slate-900/40 dark:text-slate-200">
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span>Subtotal</span>
        <span>{formatInr(subtotal)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span>Discounts</span>
        <span>-{formatInr(discountTotal)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span>Tax</span>
        <span>{formatInr(taxTotal)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span>Shipping</span>
        <span>{formatInr(shipping)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span>Rounding</span>
        <span>{formatInr(rounding)}</span>
      </div>
      <div className="mt-4 flex items-center justify-between text-base font-semibold text-slate-900 dark:text-white">
        <span>Grand Total</span>
        <span>{formatInr(grandTotal)}</span>
      </div>
    </div>
  </div>
);
