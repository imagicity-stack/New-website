import { InvoiceLineItem } from '../../../lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { formatInr } from '../../../lib/utils/currency';

export const TaxBreakdown = ({ items }: { items: InvoiceLineItem[] }) => {
  const totals = items.reduce(
    (acc, item) => {
      acc.cgst += item.cgst ?? 0;
      acc.sgst += item.sgst ?? 0;
      acc.igst += item.igst ?? 0;
      return acc;
    },
    { cgst: 0, sgst: 0, igst: 0 },
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle>GST summary</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm text-slate-600 dark:text-slate-300">
        <div className="flex items-center justify-between">
          <span>CGST</span>
          <span>{formatInr(totals.cgst)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>SGST</span>
          <span>{formatInr(totals.sgst)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>IGST</span>
          <span>{formatInr(totals.igst)}</span>
        </div>
      </CardContent>
    </Card>
  );
};
