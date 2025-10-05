import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useRepository } from '../../../lib/api/client';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Textarea, Select } from '../../../components/ui/form';
import { toast } from 'sonner';

const schema = z.object({
  name: z.string().min(2),
  hsnOrSac: z.string().optional(),
  sku: z.string().optional(),
  unit: z.string().optional(),
  price: z
    .number({ invalid_type_error: 'Price required' })
    .min(0, 'Price cannot be negative'),
  taxPreference: z.enum(['inclusive', 'exclusive', 'exempt']).default('exclusive'),
  description: z.string().optional(),
});

export const ItemCreateEditPage = ({ mode }: { mode: 'create' | 'edit' }) => {
  const repo = useRepository();
  const navigate = useNavigate();
  const params = useParams();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      hsnOrSac: '',
      sku: '',
      unit: 'service',
      price: 0,
      taxPreference: 'exclusive',
      description: '',
    },
  });

  useEffect(() => {
    if (mode === 'edit' && params.itemId) {
      repo.items.get(params.itemId).then((item) => {
        form.reset({ ...item, price: Number(item.price) });
      });
    }
  }, [form, mode, params.itemId, repo.items]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = { ...values, price: Number(values.price) };
    if (mode === 'edit' && params.itemId) {
      await repo.items.update(params.itemId, payload);
      toast.success('Item updated');
    } else {
      await repo.items.create(payload);
      toast.success('Item created');
    }
    navigate('/items');
  });

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Add item' : 'Edit item'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={onSubmit}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage>{form.formState.errors.name?.message}</FormMessage>
                </FormItem>
              )}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="hsnOrSac"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HSN / SAC</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="taxPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax preference</FormLabel>
                    <FormControl>
                      <Select {...field}>
                        <option value="exclusive">Exclusive</option>
                        <option value="inclusive">Inclusive</option>
                        <option value="exempt">Exempt</option>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} onChange={(event) => field.onChange(Number(event.target.value))} />
                  </FormControl>
                  <FormMessage>{form.formState.errors.price?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <CardFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/items')}>
                Cancel
              </Button>
              <Button type="submit">{mode === 'create' ? 'Save item' : 'Save changes'}</Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
