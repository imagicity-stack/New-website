export interface Client {
  id: string;
  displayName: string;
  legalName: string;
  email?: string;
  phone?: string;
  billingAddress?: string;
  shippingAddress?: string;
  gstin?: string;
  stateCode?: string;
  notes?: string;
  tags?: string[];
  archived?: boolean;
}

export interface Item {
  id: string;
  name: string;
  hsnOrSac?: string;
  sku?: string;
  unit?: string;
  price: number;
  taxPreference?: 'inclusive' | 'exclusive' | 'exempt';
  description?: string;
}

export interface InvoiceLineItem {
  itemId?: string;
  description: string;
  qty: number;
  unitPrice: number;
  discountType?: 'amount' | 'percent' | null;
  discountValue?: number;
  taxRate?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'overdue' | 'paid';
  clientId: string;
  lineItems: InvoiceLineItem[];
  placeOfSupply?: string;
  reverseCharge?: boolean;
  notes?: string;
  terms?: string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shipping?: number;
  rounding?: number;
  grandTotal: number;
  attachments?: string[];
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  method: string;
  amount: number;
  date: string;
  reference?: string;
  notes?: string;
}

export interface Estimate {
  id: string;
  number: string;
  date: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  clientId: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  currency: string;
  notes?: string;
}

export interface OrganizationSettings {
  id: string;
  legalName: string;
  address?: string;
  gstin?: string;
  pan?: string;
  defaultPlaceOfSupply?: string;
  primaryColor?: string;
  logoUrl?: string;
}

export interface NumberingConfig {
  prefix: string;
  nextNumber: number;
  resetPolicy: 'yearly' | 'never';
}

export interface TaxConfig {
  defaultCgst?: number;
  defaultSgst?: number;
  defaultIgst?: number;
  inclusivePricing?: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'staff';
  token: string;
}

export interface RepositoryListResponse<T> {
  data: T[];
  total: number;
}

export interface Repository<T> {
  list: (params?: { page?: number; pageSize?: number; search?: string; status?: string }) => Promise<RepositoryListResponse<T>>;
  get: (id: string) => Promise<T>;
  create: (payload: Partial<T>) => Promise<T>;
  update: (id: string, payload: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;
}

export interface ApiModeRepository {
  mode: 'rest' | 'indexeddb';
  clients: Repository<Client>;
  items: Repository<Item>;
  invoices: Repository<Invoice> & {
    generateNumber: () => Promise<string>;
    recordPayment: (id: string, payment: Payment) => Promise<Invoice>;
    send: (id: string) => Promise<void>;
  };
  payments: Repository<Payment>;
  estimates: Repository<Estimate> & {
    convertToInvoice: (id: string) => Promise<Invoice>;
  };
  auth: {
    login: (payload: { email: string; password: string }) => Promise<UserAccount>;
    register: (payload: { name: string; email: string; password: string }) => Promise<UserAccount>;
    me: () => Promise<UserAccount | null>;
  };
  settings: {
    getOrganization: () => Promise<OrganizationSettings | null>;
    updateOrganization: (payload: Partial<OrganizationSettings>) => Promise<OrganizationSettings>;
    getNumbering: () => Promise<NumberingConfig>;
    updateNumbering: (payload: Partial<NumberingConfig>) => Promise<NumberingConfig>;
    getTax: () => Promise<TaxConfig>;
    updateTax: (payload: Partial<TaxConfig>) => Promise<TaxConfig>;
    exportData: () => Promise<string>;
    importData: (payload: string, mode: 'merge' | 'replace') => Promise<void>;
  };
}
