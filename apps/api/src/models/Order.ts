import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';
import { CURRENCY_DEFAULT, ORDER_INITIAL_STATUS, ORDER_STATUSES } from '@sm/shared';
import { addressSchema, contactSchema, lineItemSchema, vehicleSchema } from './_crmSchemas';

const statusEventSchema = new Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    at: { type: Date, default: Date.now },
    note: { type: String },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    status: { type: String, enum: ORDER_STATUSES, default: ORDER_INITIAL_STATUS },
    contact: { type: contactSchema, required: true },
    shippingAddress: { type: addressSchema, default: undefined },
    vehicle: { type: vehicleSchema, default: {} },
    items: { type: [lineItemSchema], default: [] },
    // null when any item is "On Request" (no price). Stored in fils otherwise.
    subtotal: { type: Number, default: null },
    currency: { type: String, default: CURRENCY_DEFAULT },
    customerNotes: { type: String },
    internalNotes: { type: String },
    statusHistory: { type: [statusEventSchema], default: [] },
    source: { type: String, default: 'web-checkout' },
    linkedCustomer: { type: Schema.Types.ObjectId, ref: 'Customer' },
  },
  { timestamps: true },
);

orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'contact.phone': 1 });
orderSchema.index({ linkedCustomer: 1, createdAt: -1 });

export type OrderDoc = HydratedDocument<InferSchemaType<typeof orderSchema>>;
export const Order = model('Order', orderSchema);
