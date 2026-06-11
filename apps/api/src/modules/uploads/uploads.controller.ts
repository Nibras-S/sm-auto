import { asyncHandler } from '../../utils/asyncHandler';
import { env } from '../../config/env';
import { getCloudinary } from '../../config/cloudinary';

/**
 * Returns a short-lived signature so the admin browser can upload directly to
 * Cloudinary (Appendix A, fix #4 — never route image bytes through the API).
 */
export const signUpload = asyncHandler(async (_req, res) => {
  const cloud = getCloudinary(); // throws 503 if not configured
  const timestamp = Math.round(Date.now() / 1000);
  const folder = env.CLOUDINARY_FOLDER;
  const signature = cloud.utils.api_sign_request(
    { timestamp, folder },
    env.CLOUDINARY_API_SECRET as string,
  );
  res.json({
    timestamp,
    folder,
    signature,
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
  });
});
