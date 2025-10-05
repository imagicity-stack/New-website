export interface GstSplitInput {
  amount: number;
  taxRate: number;
  interstate: boolean;
}

export const splitGst = ({ amount, taxRate, interstate }: GstSplitInput) => {
  if (amount < 0) throw new Error('Amount cannot be negative');
  if (taxRate < 0) throw new Error('Tax rate cannot be negative');
  const totalTax = (amount * taxRate) / 100;
  if (interstate) {
    return {
      cgst: 0,
      sgst: 0,
      igst: Number(totalTax.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
    };
  }
  const half = Number((totalTax / 2).toFixed(2));
  return {
    cgst: half,
    sgst: half,
    igst: 0,
    totalTax: Number(totalTax.toFixed(2)),
  };
};
