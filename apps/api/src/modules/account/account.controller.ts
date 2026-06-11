import type { Request } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as svc from './account.service';
import {
  addressSchema,
  profileSchema,
  vehicleSchema,
  wishlistAddSchema,
  wishlistMergeSchema,
} from './account.validation';

const uid = (req: Request) => req.auth!.sub;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toAddr = (a: any) => ({
  id: String(a._id),
  label: a.label,
  contactName: a.contactName,
  phone: a.phone,
  line1: a.line1,
  line2: a.line2,
  area: a.area,
  city: a.city,
  emirate: a.emirate,
  country: a.country,
  isDefault: a.isDefault,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toVeh = (v: any) => ({
  id: String(v._id),
  label: v.label,
  brand: v.brand,
  model: v.model,
  generation: v.generation,
  year: v.year,
  engineType: v.engineType,
  vin: v.vin,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toProfile = (c: any) => ({
  id: c.id,
  name: c.name,
  email: c.email,
  phone: c.phone ?? undefined,
  emailVerified: Boolean(c.emailVerified),
  marketingOptIn: Boolean(c.marketingOptIn),
});

// profile
export const getProfile = asyncHandler(async (req, res) => {
  res.json({ profile: toProfile(await svc.getProfile(uid(req))) });
});
export const updateProfile = asyncHandler(async (req, res) => {
  const input = profileSchema.parse(req.body);
  res.json({ profile: toProfile(await svc.updateProfile(uid(req), input)) });
});

// addresses
export const listAddresses = asyncHandler(async (req, res) => {
  res.json({ addresses: (await svc.listAddresses(uid(req))).map(toAddr) });
});
export const addAddress = asyncHandler(async (req, res) => {
  const a = addressSchema.parse(req.body);
  res.status(201).json({ addresses: (await svc.addAddress(uid(req), a)).map(toAddr) });
});
export const updateAddress = asyncHandler(async (req, res) => {
  const a = addressSchema.parse(req.body);
  res.json({ addresses: (await svc.updateAddress(uid(req), req.params.id, a)).map(toAddr) });
});
export const removeAddress = asyncHandler(async (req, res) => {
  res.json({ addresses: (await svc.removeAddress(uid(req), req.params.id)).map(toAddr) });
});

// vehicles
export const listVehicles = asyncHandler(async (req, res) => {
  res.json({ vehicles: (await svc.listVehicles(uid(req))).map(toVeh) });
});
export const addVehicle = asyncHandler(async (req, res) => {
  const v = vehicleSchema.parse(req.body);
  res.status(201).json({ vehicles: (await svc.addVehicle(uid(req), v)).map(toVeh) });
});
export const updateVehicle = asyncHandler(async (req, res) => {
  const v = vehicleSchema.parse(req.body);
  res.json({ vehicles: (await svc.updateVehicle(uid(req), req.params.id, v)).map(toVeh) });
});
export const removeVehicle = asyncHandler(async (req, res) => {
  res.json({ vehicles: (await svc.removeVehicle(uid(req), req.params.id)).map(toVeh) });
});

// wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  res.json({ wishlist: await svc.getWishlist(uid(req)) });
});
export const addWishlist = asyncHandler(async (req, res) => {
  const { slug } = wishlistAddSchema.parse(req.body);
  res.json({ wishlist: await svc.addWishlist(uid(req), slug) });
});
export const removeWishlist = asyncHandler(async (req, res) => {
  res.json({ wishlist: await svc.removeWishlist(uid(req), req.params.slug) });
});
export const mergeWishlist = asyncHandler(async (req, res) => {
  const { slugs } = wishlistMergeSchema.parse(req.body);
  res.json({ wishlist: await svc.mergeWishlist(uid(req), slugs) });
});
