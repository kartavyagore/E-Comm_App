import path from 'path';
import { getSupabase } from './supabase.js';
import { ENV } from './env.js';

const BUCKET_NAME = ENV.SUPABASE_STORAGE_BUCKET || 'product-images';
let bucketVerified = false;

/**
 * Checks whether Supabase is configured with real credentials (not placeholders).
 */
export const isSupabaseConfigured = () => {
  return Boolean(ENV.SUPABASE_URL && ENV.SUPABASE_KEY && getSupabase());
};

/**
 * Ensures the target public storage bucket exists in Supabase.
 * If not present, attempts to create it automatically using the service role client.
 */
export const ensureBucketExists = async (supabase) => {
  if (bucketVerified || !supabase) return;
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (!error && buckets) {
      const exists = buckets.some((b) => b.name === BUCKET_NAME);
      if (!exists) {
        const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
          public: true, // Bucket must be public so product images can be loaded by customers
          fileSizeLimit: 10485760 // 10MB
        });
        if (!createError) {
          console.log(`✓ Created Supabase S3 storage bucket: "${BUCKET_NAME}" (public)`);
        } else {
          console.warn(`Notice while creating bucket "${BUCKET_NAME}":`, createError.message);
        }
      }
      bucketVerified = true;
    }
  } catch (err) {
    console.warn(`Bucket verification notice: ${err.message}`);
  }
};

/**
 * Uploads an image buffer directly into the Supabase S3 storage bucket.
 *
 * @param {Buffer} fileBuffer - The binary buffer of the uploaded image
 * @param {string} originalName - Original filename (e.g. 'headphones.jpg')
 * @param {string} mimeType - The mime type of the file (e.g. 'image/jpeg')
 * @returns {Promise<{ secure_url: string, image_url: string, storage_path: string, public_id: string }>}
 */
export const uploadToSupabaseStorage = async (
  fileBuffer,
  originalName = 'product-image.jpg',
  mimeType = 'image/jpeg'
) => {
  const supabase = getSupabase();

  if (!isSupabaseConfigured() || !supabase) {
    console.warn(
      '⚠ Supabase credentials are placeholder or not provided in .env. Using mock/local data URL fallback.'
    );
    const base64Data = fileBuffer.toString('base64');
    const safeMime = mimeType || 'image/jpeg';
    const fallbackPath = `local_${Date.now()}_${path.basename(originalName)}`;
    const dataUrl = `data:${safeMime};base64,${base64Data}`;
    return {
      secure_url: dataUrl,
      image_url: dataUrl,
      storage_path: fallbackPath,
      public_id: fallbackPath
    };
  }

  // Ensure the target S3 bucket exists
  await ensureBucketExists(supabase);

  // Generate unique, clean file path inside the bucket
  const ext = path.extname(originalName) || '.jpg';
  const cleanBase = path
    .basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  const filePath = `products/${Date.now()}_${cleanBase}${ext}`;

  // Upload buffer to Supabase S3 bucket
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, fileBuffer, {
      contentType: mimeType || 'image/jpeg',
      upsert: true
    });

  if (error) {
    throw new Error(`Failed to upload to Supabase S3 bucket: ${error.message}`);
  }

  // Retrieve public CDN URL for the uploaded object
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData?.publicUrl;
  if (!publicUrl) {
    throw new Error('Supabase Storage upload succeeded but failed to generate public URL.');
  }

  console.log(`✓ Image uploaded to Supabase S3 bucket [${BUCKET_NAME}/${filePath}]`);

  return {
    secure_url: publicUrl,
    image_url: publicUrl,
    storage_path: filePath,
    public_id: filePath
  };
};

/**
 * Deletes an image asset from the Supabase S3 storage bucket.
 *
 * @param {string} storagePath - The relative path inside the bucket (e.g. 'products/12345_image.jpg')
 */
export const deleteFromSupabaseStorage = async (storagePath) => {
  if (!storagePath || storagePath.startsWith('local_') || storagePath.startsWith('http')) {
    return { result: 'ok' };
  }

  const supabase = getSupabase();
  if (!isSupabaseConfigured() || !supabase) {
    return { result: 'ok' };
  }

  try {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([storagePath]);

    if (error) {
      console.warn(`Supabase Storage remove warning: ${error.message}`);
      return { result: 'error', error: error.message };
    }

    console.log(`✓ Deleted image from Supabase S3 bucket: ${storagePath}`);
    return { result: 'ok' };
  } catch (err) {
    console.warn(`Failed to delete from Supabase S3 bucket: ${err.message}`);
    return { result: 'error', error: err.message };
  }
};

// Aliases for backward compatibility
export const uploadToCloudinary = uploadToSupabaseStorage;
export const deleteFromCloudinary = deleteFromSupabaseStorage;

export default {
  uploadToSupabaseStorage,
  deleteFromSupabaseStorage,
  uploadToCloudinary,
  deleteFromCloudinary,
  isSupabaseConfigured,
  ensureBucketExists
};
