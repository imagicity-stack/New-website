export const NotFoundPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
    <h1 className="text-4xl font-semibold">Lost in the cloud</h1>
    <p className="mt-3 max-w-md text-center text-sm text-slate-300">
      The page you’re seeking has vanished. Use the command palette (<kbd>⌘</kbd> + <kbd>K</kbd>) or return to the dashboard.
    </p>
    <a href="/dashboard" className="mt-6 rounded-full bg-brand px-6 py-3 text-sm font-semibold">
      Go to dashboard
    </a>
  </div>
);
