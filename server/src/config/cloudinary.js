/**
 * DEPRECATED: Cloudinary integration has been replaced with Supabase S3 storage bucket.
 * This file redirects all calls to Supabase Storage for backwards compatibility.
 */
import {
  uploadToSupabaseStorage,
  deleteFromSupabaseStorage
} from './supabaseStorage.js';

export const uploadToCloudinary = uploadToSupabaseStorage;
export const deleteFromCloudinary = deleteFromSupabaseStorage;

export default {
  uploadToCloudinary,
  deleteFromCloudinary
};
