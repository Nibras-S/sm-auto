import { Schema } from 'mongoose';

export const contactSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
  },
  { _id: false },
);

export const vehicleSchema = new Schema(
  {
    brand: { type: String, trim: true },
    model: { type: String, trim: true },
    generation: { type: String, trim: true },
    year: { type: Number },
    engineType: { type: String, trim: true },
    vin: { type: String, trim: true },
  },
  { _id: false },
);

export const addressSchema = new Schema(
  {
    line1: { type: String, trim: true },
    line2: { type: String, trim: true },
    area: { type: String, trim: true },
    city: { type: String, trim: true },
    emirate: { type: String, trim: true },
    country: { type: String, trim: true, default: 'United Arab Emirates' },
  },
  { _id: false },
);

// Used for inquiry/quote/order line items. `unitPrice` (fils) is set by sales on
// orders; null means "price on enquiry".
export const lineItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    slug: { type: String },
    name: { type: String, required: true },
    sku: { type: String },
    partNumber: { type: String },
    quantity: { type: Number, default: 1, min: 1 },
    unitPrice: { type: Number, default: null },
    note: { type: String },
  },
  { _id: false },
);
