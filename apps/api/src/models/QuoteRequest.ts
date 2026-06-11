import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';
import { INQUIRY_STATUSES, InquiryStatus } from '@sm/shared';
import { contactSchema, lineItemSchema, vehicleSchema } from './_crmSchemas';

const quoteRequestSchema = new Schema(
  {
    requestNumber: { type: String, required: true, unique: true },
    status: { type: String, enum: INQUIRY_STATUSES, default: InquiryStatus.New },
    contact: { type: contactSchema, required: true },
    vehicle: { type: vehicleSchema, default: {} },
    items: { type: [lineItemSchema], default: [] },
    notes: { type: String },
    internalNotes: { type: String },
    convertedOrder: { type: Schema.Types.ObjectId, ref: 'Order' },
    linkedCustomer: { type: Schema.Types.ObjectId, ref: 'Customer' },
  },
  { timestamps: true },
);

quoteRequestSchema.index({ status: 1, createdAt: -1 });
quoteRequestSchema.index({ 'contact.phone': 1 });

export type QuoteRequestDoc = HydratedDocument<InferSchemaType<typeof quoteRequestSchema>>;
export const QuoteRequest = model('QuoteRequest', quoteRequestSchema);
