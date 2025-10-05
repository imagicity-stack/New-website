import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useRepository } from '../../../lib/api/client';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Textarea } from '../../../components/ui/form';
import { toast } from 'sonner';

const schema = z.object({
  displayName: z.string().min(2, 'Display name required'),
  legalName: z.string().min(2, 'Legal name required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  billingAddress: z.string().optional(),
  shippingAddress: z.string().optional(),
  gstin: z.string().optional(),
  stateCode: z.string().optional(),
  notes: z.string().optional(),
});

export const ClientCreateEditPage = ({ mode }: { mode: 'create' | 'edit' }) => {
  const repo = useRepository();
  const navigate = useNavigate();
  const params = useParams();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: '',
      legalName: '',
      email: '',
      phone: '',
      billingAddress: '',
      shippingAddress: '',
      gstin: '',
      stateCode: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (mode === 'edit' && params.clientId) {
      repo.clients.get(params.clientId).then((client) => {
        form.reset(client);
      });
    }
  }, [form, mode, params.clientId, repo.clients]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (mode === 'edit' && params.clientId) {
      await repo.clients.update(params.clientId, values);
      toast.success('Client updated');
    } else {
      await repo.clients.create(values);
      toast.success('Client created');
    }
    navigate('/clients');
  });

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Add client' : 'Edit client'}</CardTitle>
        <CardDescription>Capture GSTIN, addresses, and notes for quick invoice drafting.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="grid gap-6 md:grid-cols-2" onSubmit={onSubmit}>
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage>{form.formState.errors.displayName?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="legalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Legal name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage>{form.formState.errors.legalName?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage>{form.formState.errors.email?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gstin"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>GSTIN</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="29ABCDE1234F1Z5" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stateCode"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>State code</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="29" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billingAddress"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Billing address</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shippingAddress"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Shipping address</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <CardFooter className="md:col-span-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/clients')}>
                Cancel
              </Button>
              <Button type="submit">{mode === 'create' ? 'Save client' : 'Save changes'}</Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
