import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';
import { CURRENCY_DEFAULT, QUOTATION_STATUSES, QuotationStatus } from '@sm/shared';
import { contactSchema } from './_crmSchemas';

const quoteItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    partNumber: { type: String },
    quantity: { type: Number, default: 1, min: 1 },
    unitPrice: { type: Number, default: 0 }, // integer fils
  },
  { _id: false },
);

const quotationSchema = new Schema(
  {
    quotationNumber: { type: String, required: true, unique: true },
    status: { type: String, enum: QUOTATION_STATUSES, default: QuotationStatus.Draft },
    contact: { type: contactSchema, required: true },
    items: { type: [quoteItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    currency: { type: String, default: CURRENCY_DEFAULT },
    validUntil: { type: Date },
    notes: { type: String },
    linkedQuoteRequest: { type: Schema.Types.ObjectId, ref: 'QuoteRequest' },
    linkedCustomer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    convertedOrder: { type: Schema.Types.ObjectId, ref: 'Order' },
  },
  { timestamps: true },
);

quotationSchema.index({ status: 1, createdAt: -1 });

export type QuotationDoc = HydratedDocument<InferSchemaType<typeof quotationSchema>>;
export const Quotation = model('Quotation', quotationSchema);
