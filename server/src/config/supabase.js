import { createClient } from '@supabase/supabase-js';
import { ENV } from './env.js';

let supabaseClient = null;

if (ENV.SUPABASE_URL && ENV.SUPABASE_KEY) {
  try {
    supabaseClient = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_KEY, {
      auth: {
        persistSession: false
      }
    });
    console.log('✓ Connected to Supabase Cloud (PostgreSQL database & S3 Storage)');
  } catch (err) {
    console.error('⚠ Supabase initialization failed:', err.message);
  }
} else {
  console.log('ℹ Supabase credentials are placeholders or not configured in .env. Using built-in local fallback store.');
}

export const getSupabase = () => supabaseClient;
export default supabaseClient;
