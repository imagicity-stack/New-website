# Imagicity Invoicing

Imagicity Invoicing is a production-ready invoicing experience optimised for AWS Amplify Hosting. The app ships with a polished React 18 + Vite + TypeScript front-end, Tailwind-based styling, shadcn/ui primitives, React Query for data flows, and a Dexie-powered IndexedDB adapter that keeps the demo fully functional even without a live backend.

## Getting started locally

```bash
npm install
npm run dev
```

The application runs on <http://localhost:5173>. Sign in with the prefilled demo credentials and explore the dashboard, invoicing flows, and PDF previews.

### Scripts

- `npm run dev` – start Vite in development mode
- `npm run build` – create a production build in `dist`
- `npm run preview` – preview the build output locally
- `npm run lint` – run ESLint against the `src` directory
- `npm run test` – execute Vitest unit tests
- `npm run playwright` – run Playwright smoke tests (requires the dev server running separately)

## Deploy on AWS Amplify Hosting

1. Commit this repository to GitHub.
2. In AWS Amplify Hosting connect the repository and select the `main` branch.
3. Add environment variables `VITE_BRAND_NAME`, `VITE_BRAND_PRIMARY`, and optionally `VITE_API_BASE_URL` if you have a REST backend.
4. Amplify will detect the `amplify.yml` build configuration automatically. Accept it or provide the same file.
5. Redeploy on commits – Amplify will rebuild and publish the latest `dist` output.

## Architecture overview

- **React Router** powers route grouping (public auth routes vs. private app shell with `AuthGate`).
- **Zustand** manages UI state such as theme and authenticated user session, with a Dexie-backed demo mode.
- **React Query** abstracts data fetching and caching regardless of whether the REST adapter or the IndexedDB adapter is active.
- **Dexie** provides a full client-side demo, automatically seeding clients, items, and invoices.
- **pdf-lib** generates branded, A4-ready PDFs with CGST/SGST/IGST breakdowns.
- **Framer Motion** delivers subtle micro-interactions on dashboard cards and entry animations.

## Testing

Vitest covers GST computations, numbering logic, and PDF header rendering. A Playwright smoke test walks through the IndexedDB invoicing flow. Run them with:

```bash
npm run test
npm run playwright
```

(Ensure `npm run dev` is running in another terminal before executing the Playwright test.)

## Accessibility & keyboard shortcuts

The UI keeps contrast high in both light and dark themes, leverages semantic HTML, and respects key interactions:

- `N` – new invoice
- `C` – new client
- `S` – save
- `P` – preview PDF
- `G` then `D` – go to dashboard
- `F` – open global search / command palette

Enjoy creating invoices with Imagicity!
