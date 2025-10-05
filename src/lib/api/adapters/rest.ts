import axios from 'axios';
import { ApiModeRepository, Client, Estimate, Invoice, NumberingConfig, OrganizationSettings, Payment, RepositoryListResponse, TaxConfig, UserAccount } from '../../types';
import { createInvoiceNumber } from '../../utils/numbering';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

const tokenKey = 'imagicity-token';

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem(tokenKey);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('imagicity:logout'));
    }
    return Promise.reject(error);
  },
);

const list = async <T>(resource: string, params?: Record<string, unknown>): Promise<RepositoryListResponse<T>> => {
  const { data } = await api.get(resource, { params });
  return data;
};

const get = async <T>(resource: string, id: string): Promise<T> => {
  const { data } = await api.get(`${resource}/${id}`);
  return data;
};

const post = async <T>(resource: string, payload: unknown): Promise<T> => {
  const { data } = await api.post(resource, payload);
  return data;
};

const patch = async <T>(resource: string, id: string, payload: unknown): Promise<T> => {
  const { data } = await api.patch(`${resource}/${id}`, payload);
  return data;
};

const remove = async (resource: string, id: string): Promise<void> => {
  await api.delete(`${resource}/${id}`);
};

export const createRestRepository = (): ApiModeRepository => ({
  mode: 'rest',
  clients: {
    list: (params) => list<Client>('/clients', params),
    get: (id) => get<Client>('/clients', id),
    create: (payload) => post<Client>('/clients', payload),
    update: (id, payload) => patch<Client>('/clients', id, payload),
    remove: (id) => remove('/clients', id),
  },
  items: {
    list: (params) => list('/items', params),
    get: (id) => get('/items', id),
    create: (payload) => post('/items', payload),
    update: (id, payload) => patch('/items', id, payload),
    remove: (id) => remove('/items', id),
  },
  invoices: {
    list: (params) => list('/invoices', params),
    get: (id) => get('/invoices', id),
    create: (payload) => post('/invoices', payload),
    update: (id, payload) => patch('/invoices', id, payload),
    remove: (id) => remove('/invoices', id),
    generateNumber: async () => {
      const numbering = await api.get<NumberingConfig>('/settings/numbering');
      return createInvoiceNumber(numbering.data);
    },
    recordPayment: (id, payment) => post(`/invoices/${id}/payments`, payment),
    send: (id) => post(`/invoices/${id}/send`, {}),
  },
  payments: {
    list: (params) => list('/payments', params),
    get: (id) => get('/payments', id),
    create: (payload) => post('/payments', payload),
    update: (id, payload) => patch('/payments', id, payload),
    remove: (id) => remove('/payments', id),
  },
  estimates: {
    list: (params) => list('/estimates', params),
    get: (id) => get('/estimates', id),
    create: (payload) => post('/estimates', payload),
    update: (id, payload) => patch('/estimates', id, payload),
    remove: (id) => remove('/estimates', id),
    convertToInvoice: (id) => post(`/estimates/${id}/convert`, {}),
  },
  auth: {
    login: async (payload) => {
      const { data } = await api.post<UserAccount>('/auth/login', payload);
      window.localStorage.setItem(tokenKey, data.token);
      return data;
    },
    register: async (payload) => {
      const { data } = await api.post<UserAccount>('/auth/register', payload);
      window.localStorage.setItem(tokenKey, data.token);
      return data;
    },
    me: async () => {
      try {
        const { data } = await api.get<UserAccount>('/auth/me');
        return data;
      } catch (error) {
        return null;
      }
    },
  },
  settings: {
    getOrganization: async () => {
      const { data } = await api.get<OrganizationSettings>('/settings/organization');
      return data;
    },
    updateOrganization: async (payload) => {
      const { data } = await api.patch<OrganizationSettings>('/settings/organization', payload);
      return data;
    },
    getNumbering: async () => {
      const { data } = await api.get<NumberingConfig>('/settings/numbering');
      return data;
    },
    updateNumbering: async (payload) => {
      const { data } = await api.patch<NumberingConfig>('/settings/numbering', payload);
      return data;
    },
    getTax: async () => {
      const { data } = await api.get<TaxConfig>('/settings/tax');
      return data;
    },
    updateTax: async (payload) => {
      const { data } = await api.patch<TaxConfig>('/settings/tax', payload);
      return data;
    },
    exportData: async () => {
      const { data } = await api.get<string>('/settings/export');
      return data;
    },
    importData: (payload, mode) => post('/settings/import', { data: payload, mode }),
  },
});
