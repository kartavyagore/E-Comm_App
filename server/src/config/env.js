import dotenv from 'dotenv';
dotenv.config();

// Helper to detect if a value is unset or is a placeholder template
const isPlaceholder = (val) => {
  if (!val) return true;
  const str = String(val).toLowerCase().trim();
  return (
    str.includes('your-project') ||
    str.includes('your-supabase') ||
    str.includes('your-s3') ||
    str.includes('placeholder') ||
    str === 'yourpassword'
  );
};

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET || 'aura_sound_super_secret_jwt_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@aurasound.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@12345',
  ADMIN_NAME: process.env.ADMIN_NAME || 'Store Administrator',

  // Supabase Database & Storage
  SUPABASE_URL: !isPlaceholder(process.env.SUPABASE_URL)
    ? process.env.SUPABASE_URL
    : 'https://cwavjdqxjiaxpaswkeoc.supabase.co',
  SUPABASE_KEY: !isPlaceholder(process.env.SUPABASE_SERVICE_ROLE_KEY)
    ? (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)
    : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3YXZqZHF4amlheHBhc3drZW9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjQ4MDg2MiwiZXhwIjoyMTA4MDU2ODYyfQ.cSPC8QobGBf4jXDNWyX9Kb8uwBLVx5qNglQ1IIuTFvw',
  SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET || 'product-images',

  // Cloudinary Image Pipeline
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'rsjrqqov',
    API_KEY: process.env.CLOUDINARY_API_KEY || '328487549328552',
    API_SECRET: process.env.CLOUDINARY_API_SECRET || '9WRC0tXj31JW37ATm8HbuX-2_jw',
    UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET || 'ml_default'
  },

  // Supabase S3 Protocol Settings
  SUPABASE_S3_ENDPOINT: isPlaceholder(process.env.SUPABASE_S3_ENDPOINT) ? 'https://cwavjdqxjiaxpaswkeoc.supabase.co/storage/v1/s3' : (process.env.SUPABASE_S3_ENDPOINT || ''),
  SUPABASE_S3_ACCESS_KEY_ID: isPlaceholder(process.env.SUPABASE_S3_ACCESS_KEY_ID) ? '' : (process.env.SUPABASE_S3_ACCESS_KEY_ID || ''),
  SUPABASE_S3_SECRET_ACCESS_KEY: isPlaceholder(process.env.SUPABASE_S3_SECRET_ACCESS_KEY) ? '' : (process.env.SUPABASE_S3_SECRET_ACCESS_KEY || ''),
  SUPABASE_S3_REGION: process.env.SUPABASE_S3_REGION || 'us-east-1',

  // Email Notification Settings
  EMAIL: {
    HOST: process.env.SMTP_HOST || '',
    PORT: Number(process.env.SMTP_PORT) || 587,
    SECURE: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
    USER: process.env.SMTP_USER || '',
    PASS: process.env.SMTP_PASS || '',
    FROM: process.env.EMAIL_FROM || '"AURA Sound & Living" <orders@aurasound.com>'
  }
};
