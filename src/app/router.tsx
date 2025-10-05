import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthGate } from '../guards/AuthGate';
import { LoginPage } from '../features/auth/pages/Login';
import { RegisterPage } from '../features/auth/pages/Register';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPassword';
import { DashboardPage } from '../features/dashboard/pages/Dashboard';
import { ClientsListPage } from '../features/clients/pages/ClientsList';
import { ClientCreateEditPage } from '../features/clients/pages/ClientCreateEdit';
import { ClientDetailPage } from '../features/clients/pages/ClientDetail';
import { ItemsListPage } from '../features/items/pages/ItemsList';
import { ItemCreateEditPage } from '../features/items/pages/ItemCreateEdit';
import { InvoicesListPage } from '../features/invoices/pages/InvoicesList';
import { InvoiceCreatePage } from '../features/invoices/pages/InvoiceCreate';
import { InvoiceEditPage } from '../features/invoices/pages/InvoiceEdit';
import { InvoiceDetailPage } from '../features/invoices/pages/InvoiceDetail';
import { PaymentsListPage } from '../features/payments/pages/PaymentsList';
import { RecordPaymentPage } from '../features/payments/pages/RecordPayment';
import { EstimatesListPage } from '../features/estimates/pages/EstimatesList';
import { EstimateCreatePage } from '../features/estimates/pages/EstimateCreate';
import { ConvertToInvoicePage } from '../features/estimates/pages/ConvertToInvoice';
import { ReportsPage } from '../features/reports/pages/Reports';
import { SettingsPage } from '../features/settings/pages/Settings';
import { UnauthorizedPage } from '../pages/Unauthorized';
import { NotFoundPage } from '../pages/NotFound';
import { AppShell } from '../components/common/AppShell';

const privateRoutes = [
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    path: '/clients',
    children: [
      { index: true, element: <ClientsListPage /> },
      { path: 'new', element: <ClientCreateEditPage mode="create" /> },
      { path: ':clientId', element: <ClientDetailPage /> },
      { path: ':clientId/edit', element: <ClientCreateEditPage mode="edit" /> },
    ],
  },
  {
    path: '/items',
    children: [
      { index: true, element: <ItemsListPage /> },
      { path: 'new', element: <ItemCreateEditPage mode="create" /> },
      { path: ':itemId/edit', element: <ItemCreateEditPage mode="edit" /> },
    ],
  },
  {
    path: '/invoices',
    children: [
      { index: true, element: <InvoicesListPage /> },
      { path: 'new', element: <InvoiceCreatePage /> },
      { path: ':invoiceId', element: <InvoiceDetailPage /> },
      { path: ':invoiceId/edit', element: <InvoiceEditPage /> },
    ],
  },
  {
    path: '/payments',
    children: [
      { index: true, element: <PaymentsListPage /> },
      { path: 'record/:invoiceId?', element: <RecordPaymentPage /> },
    ],
  },
  {
    path: '/estimates',
    children: [
      { index: true, element: <EstimatesListPage /> },
      { path: 'new', element: <EstimateCreatePage /> },
      { path: ':estimateId/convert', element: <ConvertToInvoicePage /> },
    ],
  },
  {
    path: '/reports',
    element: <ReportsPage />,
  },
  {
    path: '/settings',
    element: <SettingsPage />,
  },
];

export const AppRouter = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/',
    element: (
      <AuthGate>
        <AppShell />
      </AuthGate>
    ),
    children: privateRoutes,
  },
  {
    path: '/auth/login',
    element: <LoginPage />,
  },
  {
    path: '/auth/register',
    element: <RegisterPage />,
  },
  {
    path: '/auth/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
