import { Customer, type CustomerDoc } from '../../models/Customer';
import { AppError } from '../../utils/AppError';

async function getCustomerOrThrow(id: string): Promise<CustomerDoc> {
  const c = await Customer.findById(id);
  if (!c) throw AppError.notFound('Account not found');
  return c;
}

// ── profile ──────────────────────────────────────────────────────────────────
export const getProfile = getCustomerOrThrow;

export async function updateProfile(
  id: string,
  input: { name?: string; phone?: string; marketingOptIn?: boolean },
) {
  const c = await getCustomerOrThrow(id);
  if (input.name !== undefined) c.name = input.name;
  if (input.phone !== undefined) c.phone = input.phone;
  if (input.marketingOptIn !== undefined) c.marketingOptIn = input.marketingOptIn;
  await c.save();
  return c;
}

// ── addresses ────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addresses(c: CustomerDoc): any {
  return c.addresses as unknown;
}

export async function listAddresses(id: string) {
  return (await getCustomerOrThrow(id)).addresses;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function addAddress(id: string, addr: any) {
  const c = await getCustomerOrThrow(id);
  if (addr.isDefault) addresses(c).forEach((a: any) => (a.isDefault = false));
  addresses(c).push(addr);
  await c.save();
  return c.addresses;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateAddress(id: string, addrId: string, addr: any) {
  const c = await getCustomerOrThrow(id);
  const sub = addresses(c).id(addrId);
  if (!sub) throw AppError.notFound('Address not found');
  if (addr.isDefault) addresses(c).forEach((a: any) => (a.isDefault = false));
  sub.set(addr);
  await c.save();
  return c.addresses;
}
export async function removeAddress(id: string, addrId: string) {
  const c = await getCustomerOrThrow(id);
  const sub = addresses(c).id(addrId);
  if (sub) sub.deleteOne();
  await c.save();
  return c.addresses;
}

// ── vehicles ─────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function vehicles(c: CustomerDoc): any {
  return c.vehicles as unknown;
}

export async function listVehicles(id: string) {
  return (await getCustomerOrThrow(id)).vehicles;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function addVehicle(id: string, v: any) {
  const c = await getCustomerOrThrow(id);
  vehicles(c).push(v);
  await c.save();
  return c.vehicles;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateVehicle(id: string, vId: string, v: any) {
  const c = await getCustomerOrThrow(id);
  const sub = vehicles(c).id(vId);
  if (!sub) throw AppError.notFound('Vehicle not found');
  sub.set(v);
  await c.save();
  return c.vehicles;
}
export async function removeVehicle(id: string, vId: string) {
  const c = await getCustomerOrThrow(id);
  const sub = vehicles(c).id(vId);
  if (sub) sub.deleteOne();
  await c.save();
  return c.vehicles;
}

// ── wishlist (product slugs) ─────────────────────────────────────────────────
export async function getWishlist(id: string) {
  return (await getCustomerOrThrow(id)).wishlist ?? [];
}
export async function addWishlist(id: string, slug: string) {
  const c = await getCustomerOrThrow(id);
  if (!c.wishlist.includes(slug)) c.wishlist.push(slug);
  await c.save();
  return c.wishlist;
}
export async function removeWishlist(id: string, slug: string) {
  const c = await getCustomerOrThrow(id);
  c.set(
    'wishlist',
    (c.wishlist ?? []).filter((s) => s !== slug),
  );
  await c.save();
  return c.wishlist;
}
export async function mergeWishlist(id: string, slugs: string[]) {
  const c = await getCustomerOrThrow(id);
  c.set('wishlist', [...new Set([...(c.wishlist ?? []), ...slugs])]);
  await c.save();
  return c.wishlist;
}
