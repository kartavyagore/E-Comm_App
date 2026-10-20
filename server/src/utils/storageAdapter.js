import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { getSupabase } from '../config/supabase.js';
import { initialCategories, initialProducts } from './seedData.js';
import { ENV } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

// Ensure local data dir exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default in-memory/file store
const getInitialStore = () => {
  const salt = bcrypt.genSaltSync(10);
  const adminEmail = (ENV.ADMIN_EMAIL || 'admin@aurasound.com').toLowerCase().trim();
  const adminPassword = ENV.ADMIN_PASSWORD || 'Admin@12345';
  const adminName = ENV.ADMIN_NAME || 'Store Administrator';

  return {
    users: [
      {
        id: "u_admin_master",
        full_name: adminName,
        email: adminEmail,
        password_hash: bcrypt.hashSync(adminPassword, salt),
        role: "admin",
        created_at: new Date().toISOString()
      }
    ],
    categories: [...initialCategories],
    products: [...initialProducts]
  };
};

// Read store from disk or initialize
const readLocalStore = () => {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      const initial = getInitialStore();
      fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const store = JSON.parse(raw);

    // Remove demo customer accounts and ensure admin account matches ENV
    let modified = false;
    if (store.users) {
      const beforeLength = store.users.length;
      store.users = store.users.filter(u => u.email !== 'alex@example.com');
      if (store.users.length !== beforeLength) modified = true;

      const adminUser = store.users.find(u => u.role === 'admin');
      const targetEmail = (ENV.ADMIN_EMAIL || 'admin@aurasound.com').toLowerCase().trim();
      const targetName = ENV.ADMIN_NAME || 'Store Administrator';
      const targetPassword = ENV.ADMIN_PASSWORD || 'Admin@12345';

      if (adminUser) {
        if (adminUser.email !== targetEmail || adminUser.full_name !== targetName) {
          adminUser.email = targetEmail;
          adminUser.full_name = targetName;
          const salt = bcrypt.genSaltSync(10);
          adminUser.password_hash = bcrypt.hashSync(targetPassword, salt);
          modified = true;
        }
      } else {
        const salt = bcrypt.genSaltSync(10);
        store.users.unshift({
          id: "u_admin_master",
          full_name: targetName,
          email: targetEmail,
          password_hash: bcrypt.hashSync(targetPassword, salt),
          role: "admin",
          created_at: new Date().toISOString()
        });
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
    }

    return store;
  } catch (err) {
    console.error('Error reading local store:', err);
    return getInitialStore();
  }
};

// Write store to disk
const writeLocalStore = (data) => {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local store:', err);
  }
};

export const db = {
  // --- USER OPERATIONS ---
  async getUserByEmail(email) {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();
      if (!error && data) return data;
    }
    const store = readLocalStore();
    return store.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  },

  async getUserById(id) {
    const supabase = getSupabase();
    if (supabase) {
      const isUuid = typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        const { data, error } = await supabase
          .from('users')
          .select('id, full_name, email, role, created_at')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) return data;
      }
    }
    const store = readLocalStore();
    const user = store.users.find(u => u.id === id);
    if (!user) return null;
    const { password_hash, ...safeUser } = user;
    return safeUser;
  },

  async createUser({ full_name, email, password_hash, role = 'customer' }) {
    const newUser = {
      id: crypto.randomUUID(),
      full_name,
      email: email.toLowerCase().trim(),
      password_hash,
      role,
      created_at: new Date().toISOString()
    };

    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();
      if (!error && data) {
        const { password_hash: _, ...safeUser } = data;
        return safeUser;
      }
      if (error) console.error('Supabase createUser error:', error.message);
    }

    const store = readLocalStore();
    store.users.push(newUser);
    writeLocalStore(store);
    const { password_hash: _, ...safeUser } = newUser;
    return safeUser;
  },

  // --- CATEGORY OPERATIONS ---
  async getCategories() {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      if (!error && data && data.length > 0) return data;
    }
    const store = readLocalStore();
    return store.categories || [];
  },

  // --- PRODUCT OPERATIONS ---
  async getProducts({ search = '', category = '', sort = 'newest', page = 1, limit = 12 }) {
    const supabase = getSupabase();
    if (supabase) {
      let query = supabase.from('products').select('*', { count: 'exact' });

      if (category && category !== 'all') {
        query = query.or(`category_id.eq.${category},category_name.ilike.%${category}%`);
      }
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      if (sort === 'price_asc') query = query.order('price', { ascending: true });
      else if (sort === 'price_desc') query = query.order('price', { ascending: false });
      else if (sort === 'rating') query = query.order('rating', { ascending: false });
      else query = query.order('created_at', { ascending: false });

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;
      if (!error && data) {
        return {
          products: data,
          total: count || data.length,
          page: Number(page),
          totalPages: Math.ceil((count || data.length) / limit)
        };
      }
    }

    // Local Store Filtering & Sorting
    const store = readLocalStore();
    let items = [...(store.products || [])];

    if (category && category !== 'all') {
      items = items.filter(
        p => p.category_id === category || (p.category_name && p.category_name.toLowerCase() === category.toLowerCase())
      );
    }

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        p => p.title.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (sort === 'price_asc') {
      items.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === 'price_desc') {
      items.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sort === 'rating') {
      items.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    } else {
      // newest
      items.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }

    const total = items.length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + Number(limit));

    return {
      products: paginatedItems,
      total,
      page: Number(page),
      totalPages: Math.max(1, Math.ceil(total / Number(limit)))
    };
  },

  async getProductById(id) {
    const supabase = getSupabase();
    if (supabase) {
      const isUuid = typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      let query = supabase.from('products').select('*');
      if (isUuid) {
        query = query.or(`id.eq.${id},slug.eq.${id}`);
      } else {
        query = query.eq('slug', id);
      }
      const { data, error } = await query.maybeSingle();
      if (!error && data) return data;
    }
    const store = readLocalStore();
    return store.products.find(p => p.id === id || p.slug === id) || null;
  },

  async createProduct(productData) {
    const slug = productData.slug || productData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const isCatUuid = typeof productData.category_id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productData.category_id);
    const newProduct = {
      id: crypto.randomUUID(),
      title: productData.title,
      slug: `${slug}-${Math.random().toString(36).substring(2, 5)}`,
      description: productData.description || '',
      price: Number(productData.price) || 0,
      category_id: isCatUuid ? productData.category_id : null,
      category_name: productData.category_name || '',
      image_url: productData.image_url,
      storage_path: productData.storage_path || productData.cloudinary_public_id || null,
      cloudinary_public_id: productData.storage_path || productData.cloudinary_public_id || null,
      stock_quantity: Number(productData.stock_quantity) || 0,
      is_featured: Boolean(productData.is_featured),
      rating: Number(productData.rating) || 5.0,
      num_reviews: Number(productData.num_reviews) || 0,
      specifications: productData.specifications || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const supabase = getSupabase();
    if (supabase) {
      const supabasePayload = {
        id: newProduct.id,
        title: newProduct.title,
        slug: newProduct.slug,
        description: newProduct.description,
        price: newProduct.price,
        category_id: newProduct.category_id,
        category_name: newProduct.category_name,
        image_url: newProduct.image_url,
        cloudinary_public_id: newProduct.cloudinary_public_id,
        stock_quantity: newProduct.stock_quantity,
        is_featured: newProduct.is_featured,
        rating: newProduct.rating,
        num_reviews: newProduct.num_reviews,
        specifications: newProduct.specifications,
        created_at: newProduct.created_at,
        updated_at: newProduct.updated_at
      };

      const { data, error } = await supabase
        .from('products')
        .insert([supabasePayload])
        .select()
        .single();
      if (!error && data) return data;
      if (error) console.error('Supabase createProduct error:', error.message);
    }

    const store = readLocalStore();
    store.products.unshift(newProduct);
    writeLocalStore(store);
    return newProduct;
  },

  async updateProduct(id, updates) {
    const supabase = getSupabase();
    if (supabase) {
      const isUuid = typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        const { storage_path, ...safeUpdates } = updates;
        const { data, error } = await supabase
          .from('products')
          .update({
            ...safeUpdates,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data;
      }
    }

    const store = readLocalStore();
    const index = store.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    store.products[index] = {
      ...store.products[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    writeLocalStore(store);
    return store.products[index];
  },

  async deleteProduct(id) {
    const supabase = getSupabase();
    if (supabase) {
      const isUuid = typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);
        if (!error) return true;
      }
    }

    const store = readLocalStore();
    const beforeCount = store.products.length;
    store.products = store.products.filter(p => p.id !== id);
    const deleted = store.products.length < beforeCount;
    if (deleted) writeLocalStore(store);
    return deleted;
  },

  // --- ORDER OPERATIONS ---
  async createOrder({
    userId = null,
    customerName,
    customerEmail,
    items = [],
    subtotal,
    shipping = 0,
    tax = 0,
    total,
    shippingAddress = {}
  }) {
    const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const isValidUuid = typeof userId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    const safeUserId = isValidUuid ? userId : null;

    const newOrder = {
      id: orderId,
      user_id: safeUserId,
      customer_name: customerName,
      customer_email: customerEmail.toLowerCase().trim(),
      items,
      subtotal: Number(subtotal),
      shipping: Number(shipping),
      tax: Number(tax),
      total: Number(total),
      shipping_address: shippingAddress,
      status: 'confirmed',
      created_at: new Date().toISOString()
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .insert([newOrder])
          .select()
          .single();
        if (!error && data) {
          for (const item of items) {
            const prod = await this.getProductById(item.id);
            if (prod) {
              const newQty = Math.max(0, prod.stock_quantity - item.quantity);
              await this.updateProduct(item.id, { stock_quantity: newQty });
            }
          }
          return data;
        } else if (error) {
          console.error('Supabase createOrder error:', error.message);
        }
      } catch (err) {
        console.error('Supabase order insert exception:', err.message);
      }
    }

    const store = readLocalStore();
    if (!store.orders) store.orders = [];
    store.orders.unshift(newOrder);

    // Decrement stock in local products
    for (const item of items) {
      const prodIndex = store.products.findIndex(p => p.id === item.id);
      if (prodIndex > -1) {
        store.products[prodIndex].stock_quantity = Math.max(
          0,
          store.products[prodIndex].stock_quantity - item.quantity
        );
      }
    }

    writeLocalStore(store);
    return newOrder;
  },

  async getAllOrders() {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase get orders notice:', err.message);
      }
    }

    const store = readLocalStore();
    return (store.orders || []).sort(
      (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
    );
  },

  async getOrderById(orderId) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .maybeSingle();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase get order by id notice:', err.message);
      }
    }

    const store = readLocalStore();
    return (store.orders || []).find(o => o.id === orderId) || null;
  },

  async getOrdersByCustomer({ userId = null, email = '' }) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const isValidUuid = typeof userId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
        let query = supabase.from('orders').select('*');
        if (isValidUuid && email) {
          query = query.or(`user_id.eq.${userId},customer_email.eq.${email.toLowerCase().trim()}`);
        } else if (isValidUuid) {
          query = query.eq('user_id', userId);
        } else if (email) {
          query = query.eq('customer_email', email.toLowerCase().trim());
        }
        query = query.order('created_at', { ascending: false });
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase get customer orders notice:', err.message);
      }
    }

    const store = readLocalStore();
    const orders = store.orders || [];
    const targetEmail = email ? email.toLowerCase().trim() : '';

    return orders.filter(
      o => (userId && o.user_id === userId) || (targetEmail && o.customer_email.toLowerCase() === targetEmail)
    ).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  },

  async updateOrderStatus(orderId, status) {
    const validStatuses = ['confirmed', 'processing', 'dispatched', 'delivered'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .update({ status })
          .eq('id', orderId)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase update order status notice:', err.message);
      }
    }

    const store = readLocalStore();
    if (!store.orders) store.orders = [];
    const orderIndex = store.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return null;

    store.orders[orderIndex] = {
      ...store.orders[orderIndex],
      status
    };
    writeLocalStore(store);
    return store.orders[orderIndex];
  },

  async getStats() {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const [{ data: prods }, { data: ords }, { data: cats }] = await Promise.all([
          supabase.from('products').select('*'),
          supabase.from('orders').select('*'),
          supabase.from('categories').select('*')
        ]);

        if (prods && ords && cats) {
          const totalProducts = prods.length;
          const lowStock = prods.filter(p => p.stock_quantity <= 10).length;
          const totalCategories = cats.length;
          const totalInventoryValue = prods.reduce((acc, p) => acc + (Number(p.price) * Number(p.stock_quantity)), 0);
          const totalOrders = ords.length;
          const totalRevenue = ords.reduce((acc, o) => acc + Number(o.total || 0), 0);
          const pendingOrders = ords.filter(o => o.status === 'confirmed' || o.status === 'processing').length;

          return {
            totalProducts,
            lowStock,
            totalCategories,
            totalInventoryValue: Math.round(totalInventoryValue),
            totalOrders,
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            pendingOrders
          };
        }
      } catch (err) {
        console.warn('Supabase getStats notice:', err.message);
      }
    }

    const store = readLocalStore();
    const products = store.products || [];
    const orders = store.orders || [];
    const totalProducts = products.length;
    const lowStock = products.filter(p => p.stock_quantity <= 10).length;
    const totalCategories = (store.categories || []).length;
    const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.stock_quantity), 0);
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, o) => acc + Number(o.total || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'confirmed' || o.status === 'processing').length;

    return {
      totalProducts,
      lowStock,
      totalCategories,
      totalInventoryValue: Math.round(totalInventoryValue),
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      pendingOrders
    };
  }
};
