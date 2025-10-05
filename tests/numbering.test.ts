import { describe, expect, it } from 'vitest';
import { createInvoiceNumber, maybeResetNumbering, nextNumbering } from '../src/lib/utils/numbering';
import dayjs from 'dayjs';

describe('invoice numbering', () => {
  it('builds number with prefix and zero padding', () => {
    const number = createInvoiceNumber({ prefix: 'IMAGI', nextNumber: 12, resetPolicy: 'yearly' });
    expect(number).toMatch(/IMAGI\d{2}\d{4}/);
  });

  it('increments next number', () => {
    const config = nextNumbering({ prefix: 'IMAGI', nextNumber: 1, resetPolicy: 'yearly' });
    expect(config.nextNumber).toBe(2);
  });

  it('resets yearly when last invoice was previous year', () => {
    const lastYear = dayjs().subtract(1, 'year').toISOString();
    const config = maybeResetNumbering({ prefix: 'IMAGI', nextNumber: 44, resetPolicy: 'yearly' }, lastYear);
    expect(config.nextNumber).toBe(1);
  });
});
