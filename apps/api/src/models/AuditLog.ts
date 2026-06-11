import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const auditLogSchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
    actorName: { type: String },
    action: { type: String }, // human label, e.g. "PATCH /admin/orders/:id/status"
    method: { type: String },
    path: { type: String },
    status: { type: Number },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

auditLogSchema.index({ createdAt: -1 });

export type AuditLogDoc = HydratedDocument<InferSchemaType<typeof auditLogSchema>>;
export const AuditLog = model('AuditLog', auditLogSchema);
