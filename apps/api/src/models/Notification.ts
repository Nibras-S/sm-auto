import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const notificationSchema = new Schema(
  {
    type: { type: String, required: true }, // new_order | new_inquiry | new_lead | new_quote_request | order_status
    title: { type: String, required: true },
    message: { type: String },
    link: { type: String }, // admin-relative path, e.g. /orders
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ read: 1, createdAt: -1 });

export type NotificationDoc = HydratedDocument<InferSchemaType<typeof notificationSchema>>;
export const Notification = model('Notification', notificationSchema);
