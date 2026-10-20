# AURA SOUND & LIVING — Full-Stack E-Commerce Platform

> **Web Developer Hiring Assignment — Complete E-Commerce Web Application**  
> **Brand**: AURA Sound & Living (Luxury Minimalist Acoustic Transducers & Architectural Workspace Gear)  
> **Frontend**: React.js (Vite) + Custom Vanilla CSS Design System  
> **Backend**: Node.js + Express.js REST API  
> **Database**: Supabase (PostgreSQL) with local zero-config fallback storage  
> **Media Management**: Supabase S3 Storage Bucket (`@supabase/supabase-js`)  
> **Authentication**: Secure JWT with bcrypt password hashing & Role-Based Access Control (RBAC)  

## 🔐 Administrator Account & Authentication

The platform uses real authentication with secure bcrypt password hashing and Role-Based Access Control (RBAC):
- **Admin Account**: Configured via `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` in `server/.env`.
  - Default Admin Email: `admin@aurasound.com` (or your custom email)
  - Default Admin Password: `Admin@12345` (or your custom password)
  - Grants exclusive access to `/admin` dashboard, product CRUD, and Supabase S3 bucket media uploads.
- **Customer Accounts**: Any customer can register directly via the **Create Customer Account** page (`/register`). Demo placeholder accounts have been removed to test with real data.


## 🚀 Quick Start Guide (Local Development)

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

### 1. Install All Dependencies
From the repository root:
```bash
npm run install:all
```
*(Or install inside `server/` and `client/` individually)*

### 2. Configure Environment Variables
- **Backend (`server/.env`)**:
  A ready-to-run `.env` file is included in `server/`. To connect your own Supabase or Cloudinary project, fill in:
  ```env
  PORT=5000
  NODE_ENV=development
  CLIENT_URL=http://localhost:5173
  JWT_SECRET=super_secret_jwt_key_for_aura_sound_ecommerce_app_2026
  JWT_EXPIRES_IN=7d

  # Supabase (PostgreSQL Database & S3 Storage Bucket)
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=your-supabase-key
  SUPABASE_STORAGE_BUCKET=product-images
  ```

### 3. Seed Database
Populate categories, initial products, and test accounts:
```bash
npm run seed
```

### 4. Start the Application
Run both servers:
- **Start Backend API** (Port 5000):
  ```bash
  npm run server
  ```
- **Start Frontend Client** (Port 5173):
  ```bash
  npm run client
  ```

Open your browser at **`http://localhost:5173`**.

---

## 🗄️ Database Architecture & Supabase Schema

The project includes `server/schema.sql`, which can be run directly in the **Supabase SQL Editor**:

```sql
-- 1. Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users (Role-Based)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(280) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    category_name VARCHAR(100),
    image_url TEXT NOT NULL,
    cloudinary_public_id VARCHAR(255),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    is_featured BOOLEAN DEFAULT false,
    rating NUMERIC(2, 1) DEFAULT 5.0,
    num_reviews INTEGER DEFAULT 0,
    specifications JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

*Note: For reviewers running locally without active cloud database credentials, the server contains an automatic local file storage adapter matching the exact Supabase table schema and operations, ensuring 100% zero-friction execution.*

---

## 🛡️ Security Implementation Details

Security is strictly enforced on the backend:
1. **Password Protection**: Passwords are never stored in plaintext; salted and hashed using `bcryptjs` (10 rounds).
2. **Stateless JWT Authentication**: Tokens signed with `HS256` containing `userId`, `email`, and `role`.
3. **Backend-Enforced Authorization (RBAC)**:
   - `verifyToken`: Validates Bearer token header.
   - `requireAdmin`: Rejects non-admin tokens with `403 Forbidden`. Hiding buttons on the client is insufficient—all Admin REST endpoints (`POST /api/admin/products`, `PUT`, `DELETE`, `POST /api/admin/upload`, `GET /api/admin/stats`) reject unauthorized requests at the route level.
4. **Cart Price & Stock Integrity**: Client-submitted unit prices are **never trusted**. The `/api/cart/verify` endpoint looks up each product in the database, verifies stock availability, clamps quantity to available stock, and calculates subtotal, tax, and freight on the server.
5. **DDoS & Brute-Force Rate Limiting**: `express-rate-limit` limits authentication endpoints.
6. **HTTP Hardening**: `helmet` headers protect against XSS, clickjacking, and MIME-sniffing.
7. **Storage Credential Secrecy**: Frontend never interacts with Supabase service role keys or storage secrets directly. Admin uploads are handled securely through Multer memory storage on the Express server and uploaded straight to the Supabase S3 bucket.

---

## 📡 REST API Reference

### Public Endpoints
- `GET /api/health` — Service health check
- `GET /api/categories` — List all categories
- `GET /api/products` — Filter catalog by `?category=`, `?search=`, `?sort=price_asc|price_desc|newest|rating`, `?page=`, `?limit=`
- `GET /api/products/featured` — Get featured homepage products
- `GET /api/products/:id` — Get product details by ID or slug
- `POST /api/auth/register` — Register customer account `{ full_name, email, password }`
- `POST /api/auth/login` — Sign in `{ email, password }`
- `POST /api/cart/verify` — Validate cart items and recalculate prices against DB

### Protected Customer Endpoints (`Authorization: Bearer <token>`)
- `GET /api/auth/me` — Get authenticated user profile

### Protected Admin Endpoints (`Authorization: Bearer <admin_token>`)
- `GET /api/admin/stats` — Dashboard metrics (total products, low stock count, valuation)
- `POST /api/admin/products` — Create new product
- `PUT /api/admin/products/:id` — Update existing product
- `DELETE /api/admin/products/:id` — Delete product & clean Supabase S3 bucket asset
- `POST /api/admin/upload` — Multer + Supabase S3 bucket image stream upload (multipart/form-data)

---

## 🎨 UI/UX & Design Philosophy

The application rejects generic AI/Bootstrap templates in favor of a cohesive, luxury architectural audio identity:
- **Color Palette**: Warm Obsidian `#0A0C10`, Elevated Slate `#12151D`, Soft Amber/Champagne `#D4A373`, Sage `#7A9E7E`.
- **Typography**: Display headings in `Outfit`, body text in `Plus Jakarta Sans`.
- **Micro-interactions**: Smooth hover image zooms, slide-over animated Cart Drawer, free-shipping live progress tracker, toast notifications, responsive mobile drawer navigation.

---

## 🌐 Production Deployment Guide

### Option 1: Frontend on Vercel
1. Push this repository to GitHub.
2. In [Vercel Dashboard](https://vercel.com), click **Add New Project** and import your repository.
3. Configure project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variable**:
   - `VITE_API_URL`: Your deployed backend URL (e.g. `https://aura-sound-api.onrender.com/api`)
5. Click **Deploy**. SPA route rewrites are pre-configured via [`client/vercel.json`](client/vercel.json).

### Option 2: Backend on Render / Railway
1. In [Render Dashboard](https://render.com), click **New Web Service** and connect your GitHub repository.
2. Configure service settings:
   - **Root Directory**: `server`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. Add **Environment Variables** (from [`server/.env.example`](server/.env.example)):
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (or leave default assigned by Render)
   - `CLIENT_URL`: `https://your-frontend-app.vercel.app`
   - `JWT_SECRET`: `your_secure_random_jwt_secret_key`
   - `ADMIN_EMAIL`: `kartavyagore0@gmail.com`
   - `ADMIN_PASSWORD`: `KartavyaGore@123`
   - `ADMIN_NAME`: `Store Administrator`
   - `SUPABASE_URL`: `https://cwavjdqxjiaxpaswkeoc.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY`: `your_supabase_service_role_key`
   - `SUPABASE_STORAGE_BUCKET`: `product-images`
   - `CLOUDINARY_CLOUD_NAME`: `rsjrqqov`
   - `CLOUDINARY_API_KEY`: `328487549328552`
   - `CLOUDINARY_API_SECRET`: `9WRC0tXj31JW37ATm8HbuX-2_jw`
4. Click **Deploy Web Service**.

---

## 🤖 AI Tools Disclosure
In compliance with Section 10 of the assignment guidelines:
- Modern LLMs (Claude / DeepMind Antigravity) were utilized for rapid scaffolding, seed dataset drafting, and test orchestration.
- All code, business logic, authorization rules, database adapters, and styling were manually structured, reviewed, integrated, and verified through end-to-end browser subagents.

