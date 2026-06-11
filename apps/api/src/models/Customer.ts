import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';
import { AuthProvider } from '@sm/shared';

const vehicleSchema = new Schema(
  {
    label: { type: String, trim: true },
    brand: { type: String, required: true, trim: true },
    model: { type: String, trim: true },
    generation: { type: String, trim: true },
    year: { type: Number },
    engineType: { type: String, trim: true },
    vin: { type: String, trim: true },
  },
  { _id: true },
);

const customerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, select: false }, // null for Google-only accounts
    googleId: { type: String, unique: true, sparse: true },
    authProvider: {
      type: String,
      enum: Object.values(AuthProvider),
      default: AuthProvider.Local,
    },
    phone: { type: String, trim: true, index: true },
    emailVerified: { type: Boolean, default: false },
    vehicles: { type: [vehicleSchema], default: [] },
    marketingOptIn: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    tokenVersion: { type: Number, default: 0 },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

export type CustomerSchemaType = InferSchemaType<typeof customerSchema>;
export type CustomerDoc = HydratedDocument<CustomerSchemaType>;
export const Customer = model('Customer', customerSchema);
