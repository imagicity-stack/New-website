import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { useState } from 'react';
import { Input } from '../../../components/ui/form';

export const ForgotPasswordPage = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-6 text-white">
      <Card className="w-full max-w-md border-none bg-white/10 p-8 text-white backdrop-blur">
        <CardHeader>
          <CardTitle>Password reset</CardTitle>
          <CardDescription className="text-slate-300">
            We’ll send a secure magic link to your registered email. Demo mode will simply confirm the action.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="space-y-4 text-sm text-slate-300">
              <p>We’ve sent reset instructions to your inbox. Check spam if it’s missing.</p>
              <Link to="/auth/login" className="text-white underline">
                Return to sign in
              </Link>
            </div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(true);
              }}
            >
              <label className="flex flex-col gap-2 text-sm">
                Email address
                <Input type="email" required placeholder="you@example.in" className="text-slate-900" />
              </label>
              <Button type="submit" className="w-full bg-brand text-white">
                Email me a link
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
