import bcrypt from 'bcryptjs';
import { getSupabase } from '../config/supabase.js';
import { initialCategories, initialProducts } from './seedData.js';
import { ENV } from '../config/env.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

const seed = async () => {
  console.log('🌱 Starting database seeding process...');

  const salt = await bcrypt.genSalt(10);
  const adminEmail = (ENV.ADMIN_EMAIL || 'admin@aurasound.com').toLowerCase().trim();
  const adminPassword = ENV.ADMIN_PASSWORD || 'Admin@12345';
  const adminName = ENV.ADMIN_NAME || 'Store Administrator';
  const adminPasswordHash = await bcrypt.hash(adminPassword, salt);

  const defaultUsers = [
    {
      id: "u_admin_master",
      full_name: adminName,
      email: adminEmail,
      password_hash: adminPasswordHash,
      role: "admin",
      created_at: new Date().toISOString()
    }
  ];

  const supabase = getSupabase();

  if (supabase) {
    console.log('→ Seeding to Supabase PostgreSQL database...');
    try {
      // 1. Seed Categories
      const { error: catErr } = await supabase.from('categories').upsert(initialCategories, { onConflict: 'slug' });
      if (catErr) console.warn('Category seed notice:', catErr.message);
      else console.log(`✓ Seeded ${initialCategories.length} categories to Supabase.`);

      // 2. Seed Users
      const { error: userErr } = await supabase.from('users').upsert(defaultUsers, { onConflict: 'email' });
      if (userErr) console.warn('User seed notice:', userErr.message);
      else console.log(`✓ Seeded ${defaultUsers.length} users to Supabase.`);

      // 3. Seed Products
      const { error: prodErr } = await supabase.from('products').upsert(initialProducts, { onConflict: 'slug' });
      if (prodErr) console.warn('Product seed notice:', prodErr.message);
      else console.log(`✓ Seeded ${initialProducts.length} products to Supabase.`);

      console.log('✨ Supabase database seeding complete!');
      return;
    } catch (err) {
      console.error('Supabase seeding failed:', err.message);
    }
  }

  // Fallback to local store file
  console.log('→ Seeding local file-backed JSON store...');
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const store = {
    users: defaultUsers,
    categories: initialCategories,
    products: initialProducts
  };

  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  console.log(`✓ Seeded ${defaultUsers.length} users, ${initialCategories.length} categories, and ${initialProducts.length} products to local store.`);
  console.log('✨ Local database seeding complete!');
};

seed().catch(console.error);
