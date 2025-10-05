import dayjs from 'dayjs';
import { NumberingConfig } from '../types';

export const createInvoiceNumber = (config: NumberingConfig) => {
  const year = dayjs().format('YY');
  const padded = `${config.nextNumber}`.padStart(4, '0');
  return `${config.prefix}${year}${padded}`;
};

export const nextNumbering = (config: NumberingConfig): NumberingConfig => ({
  ...config,
  nextNumber: config.nextNumber + 1,
});

export const maybeResetNumbering = (config: NumberingConfig, lastIssuedAt: string | null) => {
  if (config.resetPolicy !== 'yearly') return config;
  if (!lastIssuedAt) return config;
  const lastYear = dayjs(lastIssuedAt).year();
  if (lastYear !== dayjs().year()) {
    return { ...config, nextNumber: 1 };
  }
  return config;
};
