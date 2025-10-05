import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRepository } from '../../../lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Button } from '../../../components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, Input, Textarea } from '../../../components/ui/form';
import { toast } from 'sonner';

export const SettingsPage = () => {
  const repo = useRepository();
  const queryClient = useQueryClient();
  const organizationQuery = useQuery(['organization'], () => repo.settings.getOrganization());
  const numberingQuery = useQuery(['numbering'], () => repo.settings.getNumbering());
  const taxQuery = useQuery(['tax'], () => repo.settings.getTax());

  const orgForm = useForm({
    defaultValues: {
      legalName: '',
      address: '',
      gstin: '',
      pan: '',
      defaultPlaceOfSupply: '',
    },
  });

  useEffect(() => {
    if (organizationQuery.data) {
      orgForm.reset(organizationQuery.data);
    }
  }, [organizationQuery.data]);

  const onSaveOrganization = orgForm.handleSubmit(async (values) => {
    await repo.settings.updateOrganization(values);
    toast.success('Organization updated');
    await queryClient.invalidateQueries(['organization']);
  });

  const numberingForm = useForm({
    defaultValues: numberingQuery.data ?? { prefix: 'IMAGI', nextNumber: 1, resetPolicy: 'yearly' },
  });

  useEffect(() => {
    if (numberingQuery.data) numberingForm.reset(numberingQuery.data);
  }, [numberingQuery.data]);

  const onSaveNumbering = numberingForm.handleSubmit(async (values) => {
    await repo.settings.updateNumbering(values);
    toast.success('Numbering updated');
  });

  const taxForm = useForm({
    defaultValues: taxQuery.data ?? { defaultCgst: 9, defaultSgst: 9, defaultIgst: 18, inclusivePricing: false },
  });

  useEffect(() => {
    if (taxQuery.data) taxForm.reset(taxQuery.data);
  }, [taxQuery.data]);

  const onSaveTax = taxForm.handleSubmit(async (values) => {
    await repo.settings.updateTax(values);
    toast.success('Tax settings updated');
  });

  const exportData = async () => {
    const data = await repo.settings.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'imagicity-backup.json';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>, mode: 'merge' | 'replace') => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    await repo.settings.importData(text, mode);
    toast.success('Backup restored');
    await queryClient.invalidateQueries();
  };

  return (
    <Tabs defaultValue="organization" className="space-y-6">
      <TabsList>
        <TabsTrigger value="organization">Organization</TabsTrigger>
        <TabsTrigger value="branding">Branding</TabsTrigger>
        <TabsTrigger value="numbering">Numbering</TabsTrigger>
        <TabsTrigger value="taxes">Taxes</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="integrations">Integrations</TabsTrigger>
        <TabsTrigger value="backup">Backup</TabsTrigger>
      </TabsList>

      <TabsContent value="organization">
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Organization</CardTitle>
            <CardDescription>Company identity used across invoices and estimates.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...orgForm}>
              <form className="space-y-4" onSubmit={onSaveOrganization}>
                <FormField
                  control={orgForm.control}
                  name="legalName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legal name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={orgForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField control={orgForm.control} name="gstin" render={({ field }) => (
                    <FormItem>
                      <FormLabel>GSTIN</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                  <FormField control={orgForm.control} name="pan" render={({ field }) => (
                    <FormItem>
                      <FormLabel>PAN</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                  <FormField control={orgForm.control} name="defaultPlaceOfSupply" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Place of supply (state code)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
                <Button type="submit">Save</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="branding">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>Upload a logo and adjust primary color.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">Set environment variables VITE_BRAND_NAME and VITE_BRAND_PRIMARY to customize hosted builds.</p>
            <Button variant="outline" disabled>
              Upload logo (coming soon)
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="numbering">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Invoice numbering</CardTitle>
            <CardDescription>Control series prefixes and auto-increment behavior.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...numberingForm}>
              <form className="space-y-4" onSubmit={onSaveNumbering}>
                <FormField control={numberingForm.control} name="prefix" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prefix</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={numberingForm.control} name="nextNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next number</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(event) => field.onChange(Number(event.target.value))} />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={numberingForm.control} name="resetPolicy" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reset policy</FormLabel>
                    <FormControl>
                      <Select value={field.value} onChange={(event) => field.onChange(event.target.value)}>
                        <option value="yearly">Yearly</option>
                        <option value="never">Never</option>
                      </Select>
                    </FormControl>
                  </FormItem>
                )} />
                <Button type="submit">Save numbering</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="taxes">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Tax defaults</CardTitle>
            <CardDescription>Default GST percentages applied to invoices.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...taxForm}>
              <form className="space-y-4" onSubmit={onSaveTax}>
                <FormField control={taxForm.control} name="defaultCgst" render={({ field }) => (
                  <FormItem>
                    <FormLabel>CGST %</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(event) => field.onChange(Number(event.target.value))} />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={taxForm.control} name="defaultSgst" render={({ field }) => (
                  <FormItem>
                    <FormLabel>SGST %</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(event) => field.onChange(Number(event.target.value))} />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={taxForm.control} name="defaultIgst" render={({ field }) => (
                  <FormItem>
                    <FormLabel>IGST %</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(event) => field.onChange(Number(event.target.value))} />
                    </FormControl>
                  </FormItem>
                )} />
                <Button type="submit">Save tax defaults</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="users">
        <Card>
          <CardHeader>
            <CardTitle>Users & roles</CardTitle>
            <CardDescription>Invite teammates and assign Owner, Manager, or Staff permissions.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">Role management integrates with your backend in production. Demo mode assumes a single owner.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="integrations">
        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>Toggle payment and communication integrations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <label className="flex items-center justify-between rounded-2xl bg-white/60 px-4 py-3 dark:bg-slate-900/60">
              <span>Razorpay</span>
              <span className="text-xs text-slate-400">Coming soon</span>
            </label>
            <label className="flex items-center justify-between rounded-2xl bg-white/60 px-4 py-3 dark:bg-slate-900/60">
              <span>Stripe</span>
              <span className="text-xs text-slate-400">Coming soon</span>
            </label>
            <label className="flex items-center justify-between rounded-2xl bg-white/60 px-4 py-3 dark:bg-slate-900/60">
              <span>Gmail send</span>
              <span className="text-xs text-slate-400">Coming soon</span>
            </label>
            <label className="flex items-center justify-between rounded-2xl bg-white/60 px-4 py-3 dark:bg-slate-900/60">
              <span>Webhooks</span>
              <span className="text-xs text-slate-400">Coming soon</span>
            </label>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="backup">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Backup & restore</CardTitle>
            <CardDescription>Export demo data or import a saved JSON backup.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={exportData}>Export JSON</Button>
            <div className="space-y-2 text-sm text-slate-500">
              <label className="flex flex-col gap-2">
                Merge data
                <input type="file" accept="application/json" onChange={(event) => importData(event, 'merge')} />
              </label>
              <label className="flex flex-col gap-2">
                Replace data
                <input type="file" accept="application/json" onChange={(event) => importData(event, 'replace')} />
              </label>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
