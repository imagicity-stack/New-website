import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Invoice, Client, OrganizationSettings } from '../types';
import dayjs from 'dayjs';
import { formatInr } from '../utils/currency';

export const makeInvoicePdf = async ({
  invoice,
  client,
  organization,
}: {
  invoice: Invoice;
  client: Client;
  organization: OrganizationSettings | null;
}) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { height, width } = page.getSize();
  const margin = 48;
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const drawText = (text: string, x: number, y: number, options?: { size?: number; font?: any; color?: ReturnType<typeof rgb> }) => {
    page.drawText(text, {
      x,
      y,
      size: options?.size ?? 11,
      font: options?.font ?? font,
      color: options?.color ?? rgb(0.1, 0.13, 0.2),
    });
  };

  // Header background ribbon
  page.drawRectangle({
    x: 0,
    y: height - 140,
    width,
    height: 140,
    color: rgb(0.78, 0.063, 0.18),
  });

  drawText(organization?.legalName ?? 'Imagicity Invoicing', margin, height - 70, { size: 24, font: bold, color: rgb(1, 1, 1) });
  drawText('Tax-ready invoice', margin, height - 100, { size: 12, color: rgb(1, 1, 1) });

  const rightX = width - margin - 180;
  drawText(`Invoice #: ${invoice.number}`, rightX, height - 70, { font: bold, size: 12, color: rgb(1, 1, 1) });
  drawText(`Date: ${dayjs(invoice.date).format('DD MMM YYYY')}`, rightX, height - 90, { color: rgb(1, 1, 1) });
  drawText(`Due: ${dayjs(invoice.dueDate).format('DD MMM YYYY')}`, rightX, height - 110, { color: rgb(1, 1, 1) });

  const bodyTop = height - 170;
  drawText('Bill to', margin, bodyTop, { font: bold });
  drawText(client.displayName, margin, bodyTop - 18, { font: bold });
  drawText(client.billingAddress ?? '', margin, bodyTop - 34);
  drawText(`GSTIN: ${client.gstin ?? 'N/A'}`, margin, bodyTop - 50);

  drawText('Place of supply', width / 2, bodyTop, { font: bold });
  drawText(invoice.placeOfSupply ?? organization?.defaultPlaceOfSupply ?? 'N/A', width / 2, bodyTop - 18);
  drawText(`Reverse charge: ${invoice.reverseCharge ? 'Yes' : 'No'}`, width / 2, bodyTop - 36);

  // Table header
  const tableTop = bodyTop - 70;
  const columns = [margin, margin + 200, margin + 320, margin + 390, margin + 460];
  drawText('Description', columns[0], tableTop, { font: bold });
  drawText('Qty', columns[1], tableTop, { font: bold });
  drawText('Rate', columns[2], tableTop, { font: bold });
  drawText('Tax', columns[3], tableTop, { font: bold });
  drawText('Amount', columns[4], tableTop, { font: bold });

  let currentY = tableTop - 20;
  invoice.lineItems.forEach((item) => {
    drawText(item.description, columns[0], currentY);
    drawText(String(item.qty), columns[1], currentY);
    drawText(formatInr(item.unitPrice), columns[2], currentY);
    const taxParts = [`CGST ${item.cgst?.toFixed(2) ?? '0.00'}`, `SGST ${item.sgst?.toFixed(2) ?? '0.00'}`, `IGST ${item.igst?.toFixed(2) ?? '0.00'}`]
      .filter((part) => !part.endsWith('0.00'))
      .join(' / ');
    drawText(taxParts || '—', columns[3], currentY);
    drawText(formatInr(item.qty * item.unitPrice), columns[4], currentY);
    currentY -= 18;
  });

  const totalsY = currentY - 30;
  const totals = [
    ['Subtotal', invoice.subtotal],
    ['Discounts', -invoice.discountTotal],
    ['Tax', invoice.taxTotal],
    ['Shipping', invoice.shipping ?? 0],
    ['Rounding', invoice.rounding ?? 0],
    ['Grand Total', invoice.grandTotal],
  ];

  totals.forEach(([label, value], index) => {
    drawText(label as string, columns[3], totalsY - index * 18, { font: index === totals.length - 1 ? bold : font });
    drawText(formatInr(value as number), columns[4], totalsY - index * 18, {
      font: index === totals.length - 1 ? bold : font,
    });
  });

  const footerY = 120;
  drawText('Notes', margin, footerY, { font: bold });
  drawText(invoice.notes ?? 'Thank you for partnering with Imagicity.', margin, footerY - 20);
  drawText('Terms', margin, footerY - 60, { font: bold });
  drawText(
    invoice.terms ??
      'Payment due in 7 days. UPI: demo@upi. Bank: Imagicity Bank, IFSC IMAG0000123. Late payments attract 1.5% monthly interest.',
    margin,
    footerY - 80,
  );

  drawText('Authorised signature', width - margin - 180, footerY - 40, { font: bold });
  page.drawLine({ start: { x: width - margin - 180, y: footerY - 60 }, end: { x: width - margin - 20, y: footerY - 60 }, thickness: 1, color: rgb(0.6, 0.6, 0.6) });

  return pdfDoc.save();
};
