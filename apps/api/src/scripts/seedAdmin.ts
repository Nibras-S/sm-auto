import { AdminRole } from '@sm/shared';
import { connectDb, disconnectDb } from '../config/db';
import { AdminUser } from '../models/AdminUser';
import { hashPassword } from '../modules/auth/auth.service';

async function main() {
  await connectDb();

  const name = process.env.SEED_ADMIN_NAME ?? 'Super Admin';
  const email = (process.env.SEED_ADMIN_EMAIL ?? 'admin@sparemec.local').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';

  const existing = await AdminUser.findOne({ email });
  if (existing) {
    // eslint-disable-next-line no-console
    console.log(`ℹ️  Super Admin already exists: ${email}`);
    await disconnectDb();
    return;
  }

  const passwordHash = await hashPassword(password);
  await AdminUser.create({ name, email, passwordHash, role: AdminRole.SuperAdmin, isActive: true });

  // eslint-disable-next-line no-console
  console.log(`✅ Seeded Super Admin\n   email:    ${email}\n   password: ${password}\n   ⚠️  Change this password after first login.`);
  await disconnectDb();
}

main().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error('❌ Seed failed:', err);
  await disconnectDb();
  process.exit(1);
});
