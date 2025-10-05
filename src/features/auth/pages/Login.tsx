import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../../../components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input } from '../../../components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Minimum 6 characters'),
});

export const LoginPage = () => {
  const auth = useAuth();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: 'demo@imagicity.in',
      password: 'password',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await auth.login(values);
  });

  if (auth.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
      <Card className="w-full max-w-md border-none bg-white/10 p-8 text-white backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Imagicity Invoicing</CardTitle>
          <CardDescription className="text-slate-300">
            Sign in to orchestrate invoices, clients, and tax-ready reports with grace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6" onSubmit={onSubmit}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.in" type="email" {...field} />
                    </FormControl>
                    <FormMessage>{form.formState.errors.email?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" type="password" {...field} />
                    </FormControl>
                    <FormMessage>{form.formState.errors.password?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between text-sm">
                <Link to="/auth/forgot-password" className="text-slate-300 hover:text-white">
                  Forgot password?
                </Link>
                <Link to="/auth/register" className="text-slate-300 hover:text-white">
                  Create account
                </Link>
              </div>
              <Button type="submit" className="w-full bg-brand text-white">
                Sign in
              </Button>
            </form>
          </Form>
          <p className="mt-6 text-xs text-slate-400">
            Demo credentials are pre-filled. No backend required—IndexedDB mode will persist your session locally.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
