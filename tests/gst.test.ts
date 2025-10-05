import { describe, expect, it } from 'vitest';
import { splitGst } from '../src/lib/utils/gst';

describe('GST split', () => {
  it('splits intrastate tax into CGST and SGST', () => {
    const result = splitGst({ amount: 1000, taxRate: 18, interstate: false });
    expect(result.cgst).toBeCloseTo(90);
    expect(result.sgst).toBeCloseTo(90);
    expect(result.igst).toBe(0);
    expect(result.totalTax).toBeCloseTo(180);
  });

  it('keeps IGST for interstate transactions', () => {
    const result = splitGst({ amount: 2000, taxRate: 18, interstate: true });
    expect(result.igst).toBeCloseTo(360);
    expect(result.cgst).toBe(0);
    expect(result.sgst).toBe(0);
  });

  it('rejects negative amounts', () => {
    expect(() => splitGst({ amount: -10, taxRate: 18, interstate: false })).toThrow();
  });
});
