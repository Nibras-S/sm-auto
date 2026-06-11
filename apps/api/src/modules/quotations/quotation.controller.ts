import type { Response } from 'express';
import PDFDocument from 'pdfkit';
import { formatMoney } from '@sm/shared';
import { asyncHandler } from '../../utils/asyncHandler';
import { numParam, pageMeta } from '../../utils/pagination';
import * as svc from './quotation.service';
import { toOrderDTO } from '../crm/crm.serializers';
import {
  fromQuoteRequestSchema,
  quotationCreateSchema,
  quotationStatusSchema,
  quotationUpdateSchema,
} from './quotation.validation';

const str = (v: unknown) => (typeof v === 'string' && v.length ? v : undefined);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toQuotationDTO(q: any) {
  return {
    id: q.id,
    quotationNumber: q.quotationNumber,
    status: q.status,
    contact: { name: q.contact?.name ?? '', phone: q.contact?.phone ?? undefined, email: q.contact?.email ?? undefined },
    items: (q.items ?? []).map((i: any) => ({
      productId: i.product ? String(i.product) : null,
      name: i.name,
      partNumber: i.partNumber ?? undefined,
      quantity: i.quantity,
      unitPrice: i.unitPrice ?? 0,
    })),
    subtotal: q.subtotal ?? 0,
    currency: q.currency ?? 'AED',
    validUntil: q.validUntil ? new Date(q.validUntil).toISOString() : undefined,
    notes: q.notes ?? undefined,
    linkedQuoteRequestId: q.linkedQuoteRequest ? String(q.linkedQuoteRequest) : null,
    linkedCustomerId: q.linkedCustomer ? String(q.linkedCustomer) : null,
    convertedOrderId: q.convertedOrder ? String(q.convertedOrder) : null,
    createdAt: q.createdAt ? new Date(q.createdAt).toISOString() : undefined,
    updatedAt: q.updatedAt ? new Date(q.updatedAt).toISOString() : undefined,
  };
}

export const list = asyncHandler(async (req, res) => {
  const r = await svc.listQuotations({
    status: str(req.query.status),
    q: str(req.query.q),
    page: numParam(req.query.page),
    limit: numParam(req.query.limit),
  });
  res.json({ data: r.data.map(toQuotationDTO), meta: pageMeta(r.total, r.page, r.limit) });
});
export const get = asyncHandler(async (req, res) => {
  res.json({ quotation: toQuotationDTO(await svc.getQuotation(req.params.id)) });
});
export const create = asyncHandler(async (req, res) => {
  const input = quotationCreateSchema.parse(req.body);
  res.status(201).json({ quotation: toQuotationDTO(await svc.createQuotation(input)) });
});
export const createFromQuote = asyncHandler(async (req, res) => {
  const { quoteRequestId } = fromQuoteRequestSchema.parse(req.body);
  res.status(201).json({ quotation: toQuotationDTO(await svc.createFromQuoteRequest(quoteRequestId)) });
});
export const update = asyncHandler(async (req, res) => {
  const input = quotationUpdateSchema.parse(req.body);
  res.json({ quotation: toQuotationDTO(await svc.updateQuotation(req.params.id, input)) });
});
export const setStatus = asyncHandler(async (req, res) => {
  const { status } = quotationStatusSchema.parse(req.body);
  res.json({ quotation: toQuotationDTO(await svc.setStatus(req.params.id, status)) });
});
export const convert = asyncHandler(async (req, res) => {
  res.status(201).json({ order: toOrderDTO(await svc.convertToOrder(req.params.id)) });
});

export const pdf = asyncHandler(async (req, res) => {
  const q = await svc.getQuotation(req.params.id);
  streamPdf(q, res);
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function streamPdf(q: any, res: Response) {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${q.quotationNumber}.pdf"`);
  doc.pipe(res);

  doc.fontSize(22).fillColor('#b91c1c').text('Spare Mec', { continued: false });
  doc.fillColor('#111111').fontSize(10).text('Auto Spare Parts — Dubai, United Arab Emirates');
  doc.moveDown(1);

  doc.fontSize(16).text('QUOTATION');
  doc.fontSize(10).text(`Number: ${q.quotationNumber}`);
  doc.text(`Status: ${q.status}`);
  if (q.validUntil) doc.text(`Valid until: ${new Date(q.validUntil).toLocaleDateString()}`);
  doc.moveDown(1);

  doc.font('Helvetica-Bold').text('Bill To');
  doc.font('Helvetica').text(q.contact?.name ?? '');
  if (q.contact?.phone) doc.text(q.contact.phone);
  if (q.contact?.email) doc.text(q.contact.email);
  doc.moveDown(1);

  doc.font('Helvetica-Bold').text('Items');
  doc.font('Helvetica');
  let total = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (q.items ?? []).forEach((i: any) => {
    const lineTotal = (i.unitPrice ?? 0) * (i.quantity ?? 1);
    total += lineTotal;
    doc.fontSize(10).text(
      `${i.name}${i.partNumber ? ` (${i.partNumber})` : ''}  —  Qty ${i.quantity} × ${formatMoney(i.unitPrice ?? 0)} = ${formatMoney(lineTotal)}`,
    );
  });
  doc.moveDown(1);
  doc.font('Helvetica-Bold').fontSize(12).text(`Total: ${formatMoney(q.subtotal ?? total)}`, { align: 'right' });

  if (q.notes) {
    doc.moveDown(1);
    doc.font('Helvetica').fontSize(9).fillColor('#555555').text(`Notes: ${q.notes}`);
  }
  doc.moveDown(2);
  doc.fontSize(8).fillColor('#999999').text('This quotation is subject to confirmation of availability. Thank you for your business.');
  doc.end();
}
