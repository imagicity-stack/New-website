import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useRepository } from '../../../lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { formatInr } from '../../../lib/utils/currency';
import { Line, LineChart, ResponsiveContainer, Tooltip as RechartTooltip, XAxis, YAxis, BarChart, Bar, Pie, PieChart, Cell } from 'recharts';
import dayjs from 'dayjs';
import { Skeleton } from '../../../components/ui/skeleton';

const gradientBackground = 'bg-[radial-gradient(circle_at_top,_rgba(200,16,46,0.35),rgba(15,23,42,0.95))]';

export const DashboardPage = () => {
  const repo = useRepository();
  const invoicesQuery = useQuery(['invoices'], () => repo.invoices.list());
  const clientsQuery = useQuery(['clients'], () => repo.clients.list());
  const paymentsQuery = useQuery(['payments'], () => repo.payments.list());

  const kpis = useMemo(() => {
    const invoices = invoicesQuery.data?.data ?? [];
    const now = dayjs();
    const mrr = invoices.filter((invoice) => invoice.status === 'paid').reduce((acc, invoice) => acc + invoice.grandTotal, 0) / 12;
    const outstanding = invoices.filter((invoice) => invoice.status !== 'paid').reduce((acc, invoice) => acc + invoice.grandTotal, 0);
    const overdue = invoices.filter((invoice) => dayjs(invoice.dueDate).isBefore(now) && invoice.status !== 'paid').length;
    const dso = invoices.length
      ? invoices.reduce((acc, invoice) => acc + dayjs(invoice.dueDate).diff(invoice.date, 'day'), 0) / invoices.length
      : 0;
    return [
      { label: 'MRR (simulated)', value: formatInr(Number.isFinite(mrr) ? mrr : 0) },
      { label: 'Outstanding receivables', value: formatInr(outstanding) },
      { label: 'Overdue invoices', value: overdue.toString() },
      { label: 'Average DSO', value: `${Math.round(dso)} days` },
    ];
  }, [invoicesQuery.data]);

  const revenueData = useMemo(() => {
    const invoices = invoicesQuery.data?.data ?? [];
    const grouped = invoices.reduce<Record<string, number>>((acc, invoice) => {
      const month = dayjs(invoice.date).format('MMM');
      acc[month] = (acc[month] ?? 0) + invoice.grandTotal;
      return acc;
    }, {});
    return Object.entries(grouped).map(([month, value]) => ({ month, value }));
  }, [invoicesQuery.data]);

  const taxData = useMemo(() => {
    const invoices = invoicesQuery.data?.data ?? [];
    const totals = invoices.reduce(
      (acc, invoice) => {
        invoice.lineItems.forEach((item) => {
          acc.cgst += item.cgst ?? 0;
          acc.sgst += item.sgst ?? 0;
          acc.igst += item.igst ?? 0;
        });
        return acc;
      },
      { cgst: 0, sgst: 0, igst: 0 },
    );
    return [
      { name: 'CGST', value: totals.cgst },
      { name: 'SGST', value: totals.sgst },
      { name: 'IGST', value: totals.igst },
    ];
  }, [invoicesQuery.data]);

  const gradientCards = (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi, index) => (
        <motion.div
          key={kpi.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`rounded-2xl border border-white/10 p-[1px] ${gradientBackground}`}
        >
          <div className="rounded-[1.75rem] bg-slate-900/70 p-6 text-white shadow-card">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-300">{kpi.label}</p>
            <p className="mt-3 text-2xl font-semibold">{kpi.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );

  if (invoicesQuery.isLoading || clientsQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-3xl" />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 text-white shadow-card">
        <p className="text-xs uppercase tracking-[0.45em] text-brand/70">Imagicity Invoicing</p>
        <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-semibold">Namaste, {clientsQuery.data?.total ?? 0} relationships thriving.</h2>
            <p className="mt-3 max-w-xl text-sm text-slate-300">
              Keep an eye on receivables, taxes, and team workflows in one craftfully curated HQ. Keyboard shortcuts await: <strong>N</strong> for invoice, <strong>F</strong> for search.
            </p>
          </div>
        </div>
        <div className="mt-8">{gradientCards}</div>
      </section>
      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Revenue by month</CardTitle>
            <CardDescription>Track how your collections are trending.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                <RechartTooltip formatter={(value) => formatInr(Number(value))} />
                <Line type="monotone" dataKey="value" stroke="#C8102E" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tax mix</CardTitle>
            <CardDescription>Breakdown of CGST / SGST / IGST from invoices.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={taxData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={4}>
                  {taxData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={['#C8102E', '#16a34a', '#6366f1'][index % 3]}
                    />
                  ))}
                </Pie>
                <RechartTooltip formatter={(value, label) => [`${formatInr(Number(value))}`, label as string]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Collections</CardTitle>
            <CardDescription>Track payments recorded via UPI, bank transfer, or other methods.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(paymentsQuery.data?.data ?? []).map((payment) => ({
                month: dayjs(payment.date).format('MMM'),
                amount: payment.amount,
              }))}>
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                <Bar dataKey="amount" fill="#0ea5e9" radius={[12, 12, 12, 12]} />
                <RechartTooltip formatter={(value) => formatInr(Number(value))} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
            <CardDescription>Active clients served and opportunities to upsell.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {(clientsQuery.data?.data ?? []).map((client) => (
                <li key={client.id} className="flex items-center justify-between rounded-2xl bg-slate-100/60 px-4 py-3 dark:bg-slate-800/70">
                  <span className="font-medium text-slate-800 dark:text-slate-100">{client.displayName}</span>
                  <span className="text-xs uppercase text-slate-400">{client.stateCode ?? 'NA'}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};
