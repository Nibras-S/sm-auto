import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';
import { ADMIN_ROLES, AdminRole } from '@sm/shared';

const adminUserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ADMIN_ROLES, required: true, default: AdminRole.Viewer },
    // permissionOverrides entries look like "+settings.write" / "-product.delete"
    permissionOverrides: { type: [String], default: [] },
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    // Bumped to invalidate all issued refresh tokens (Appendix A, fix #2).
    tokenVersion: { type: Number, default: 0 },
    lastLoginAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true },
);

adminUserSchema.index({ role: 1, isActive: 1 });

export type AdminUserSchemaType = InferSchemaType<typeof adminUserSchema>;
export type AdminUserDoc = HydratedDocument<AdminUserSchemaType>;
export const AdminUser = model('AdminUser', adminUserSchema);
