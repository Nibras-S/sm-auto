import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';
import { AppError } from '../utils/AppError';

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
  );
}

let configured = false;

/** Returns the configured Cloudinary client, or throws a clear error in dev. */
export function getCloudinary() {
  if (!isCloudinaryConfigured()) {
    throw new AppError(
      503,
      'CLOUDINARY_NOT_CONFIGURED',
      'Image uploads are not configured. Set CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET.',
    );
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

/** Best-effort delete of an asset; never throws (used during product/image removal). */
export async function destroyAsset(publicId: string | null | undefined): Promise<void> {
  if (!publicId || !isCloudinaryConfigured()) return;
  try {
    await getCloudinary().uploader.destroy(publicId);
  } catch {
    /* ignore — orphaned asset cleanup is non-critical */
  }
}
