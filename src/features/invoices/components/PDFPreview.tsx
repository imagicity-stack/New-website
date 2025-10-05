import { useEffect, useState } from 'react';
import { makeInvoicePdf } from '../../../lib/pdf/makeInvoicePdf';
import { Invoice, Client, OrganizationSettings } from '../../../lib/types';
import { Button } from '../../../components/ui/button';

export const PDFPreview = ({ invoice, client, organization }: { invoice: Invoice; client: Client; organization: OrganizationSettings | null }) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let currentUrl: string | null = null;
    const render = async () => {
      const pdf = await makeInvoicePdf({ invoice, client, organization });
      const blob = new Blob([pdf], { type: 'application/pdf' });
      currentUrl = URL.createObjectURL(blob);
      setUrl(currentUrl);
    };
    void render();
    return () => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [invoice, client, organization]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">PDF preview</h3>
        {url && (
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <a href={url} download={`${invoice.number}.pdf`}>
                Download PDF
              </a>
            </Button>
          </div>
        )}
      </div>
      {url ? (
        <iframe title="Invoice PDF preview" src={url} className="h-96 w-full rounded-b-2xl" />
      ) : (
        <p className="p-6 text-sm text-slate-500">Generating preview…</p>
      )}
    </div>
  );
};
