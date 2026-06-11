import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';
import { LEAD_STATUSES, LeadStatus } from '@sm/shared';

const leadSchema = new Schema(
  {
    leadNumber: { type: String, required: true, unique: true },
    status: { type: String, enum: LEAD_STATUSES, default: LeadStatus.New },
    source: { type: String, default: 'Chatbot' },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    vehicleBrand: { type: String, trim: true },
    vehicleModel: { type: String, trim: true },
    vehicleYear: { type: Number },
    requiredPart: { type: String, trim: true },
    notes: { type: String },
    internalNotes: { type: String },
    linkedCustomer: { type: Schema.Types.ObjectId, ref: 'Customer' },
  },
  { timestamps: true },
);

leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ phone: 1 });

export type LeadDoc = HydratedDocument<InferSchemaType<typeof leadSchema>>;
export const Lead = model('Lead', leadSchema);
