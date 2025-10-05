export const UnauthorizedPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
    <h1 className="text-4xl font-semibold">Access restricted</h1>
    <p className="mt-3 max-w-md text-center text-sm text-slate-300">
      Your role doesn’t permit this action yet. Contact the workspace owner to gain access.
    </p>
    <a href="/dashboard" className="mt-6 rounded-full bg-brand px-6 py-3 text-sm font-semibold">
      Return home
    </a>
  </div>
);
