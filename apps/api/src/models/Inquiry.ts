import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';
import { INQUIRY_SOURCES, INQUIRY_STATUSES, InquiryStatus } from '@sm/shared';
import { contactSchema, lineItemSchema, vehicleSchema } from './_crmSchemas';

const inquirySchema = new Schema(
  {
    inquiryNumber: { type: String, required: true, unique: true },
    source: { type: String, enum: INQUIRY_SOURCES, required: true },
    status: { type: String, enum: INQUIRY_STATUSES, default: InquiryStatus.New },
    contact: { type: contactSchema, required: true },
    vehicle: { type: vehicleSchema, default: {} },
    emirate: { type: String, trim: true },
    items: { type: [lineItemSchema], default: [] },
    message: { type: String },
    internalNotes: { type: String },
    linkedCustomer: { type: Schema.Types.ObjectId, ref: 'Customer' },
  },
  { timestamps: true },
);

inquirySchema.index({ status: 1, createdAt: -1 });
inquirySchema.index({ source: 1 });
inquirySchema.index({ 'contact.phone': 1 });

export type InquiryDoc = HydratedDocument<InferSchemaType<typeof inquirySchema>>;
export const Inquiry = model('Inquiry', inquirySchema);
