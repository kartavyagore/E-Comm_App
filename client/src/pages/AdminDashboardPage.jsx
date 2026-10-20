import React, { useState, useEffect } from 'react';
import {
  Package,
  AlertCircle,
  Plus,
  Search,
  Edit3,
  Trash2,
  DollarSign,
  Layers,
  Sparkles,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  User,
  Eye,
  RefreshCw,
  Loader2,
  X,
  Mail,
  MapPin
} from 'lucide-react';
import { adminService } from '../services/adminService.js';
import { productService } from '../services/productService.js';
import { orderService } from '../services/orderService.js';
import { ProductModal } from '../components/admin/ProductModal.jsx';
import { DeleteConfirmModal } from '../components/admin/DeleteConfirmModal.jsx';
import { useToast } from '../context/ToastContext.jsx';

export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders'
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Products filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Orders filtering
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);

  const { showToast } = useToast();

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, prodRes, catRes, ordersRes] = await Promise.all([
        adminService.getStats(),
        productService.getProducts({ limit: 100 }),
        productService.getCategories(),
        orderService.getAdminOrders().catch(() => ({ orders: [] }))
      ]);

      setStats(statsRes?.stats || statsRes?.data?.stats || (statsRes && !statsRes.data ? statsRes : null));
      setProducts(prodRes?.products || prodRes?.data?.products || []);
      setCategories(catRes?.categories || catRes?.data?.categories || []);
      setOrders(ordersRes?.orders || ordersRes?.data?.orders || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      showToast(err.message || 'Failed to authenticate admin dashboard.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (productData, id) => {
    if (id) {
      await adminService.updateProduct(id, productData);
      showToast('Product updated successfully in catalog.', 'success');
    } else {
      await adminService.createProduct(productData);
      showToast('New product added to catalog.', 'success');
    }
    await loadDashboardData();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      await adminService.deleteProduct(deletingProduct.id);
      showToast(`"${deletingProduct.title}" has been deleted.`, 'success');
      setDeletingProduct(null);
      await loadDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to delete product.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      showToast(`Order #${orderId} status set to "${newStatus}".`, 'success');
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (viewingOrder && viewingOrder.id === orderId) {
        setViewingOrder((prev) => ({ ...prev, status: newStatus }));
      }
      // Refresh stats
      const statsRes = await adminService.getStats();
      const updatedStats = statsRes?.stats || statsRes?.data?.stats || (statsRes && !statsRes.data ? statsRes : null);
      if (updatedStats) setStats(updatedStats);
    } catch (err) {
      showToast(err.message || 'Failed to update order status.', 'error');
    }
  };

  // Products Filter
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category_name && p.category_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' ||
      p.category_id === selectedCategory ||
      (p.category_name && p.category_name.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  // Orders Filter
  const filteredOrders = orders.filter((o) => {
    const q = orderSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
      (o.customer_email && o.customer_email.toLowerCase().includes(q)) ||
      (o.items && o.items.some((it) => it.title.toLowerCase().includes(q)));

    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '6rem' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        <div>
          <div className="badge badge-gold" style={{ marginBottom: '0.4rem' }}>
            Store Management Portal
          </div>
          <h1 className="heading-display" style={{ fontSize: '2.2rem' }}>
            Admin Control Center
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Manage catalog inventory, inspect customer orders, and update dispatch statuses.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={loadDashboardData} className="btn btn-secondary btn-sm" title="Refresh data">
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          {activeTab === 'products' && (
            <button onClick={handleOpenAddModal} className="btn btn-primary">
              <Plus size={18} />
              <span>Add New Product</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. Global Metrics Analytics Cards */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem'
          }}
        >
          {/* Card 1: Total Products */}
          <div className="glass-card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Products
              </span>
              <div style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', color: 'var(--accent-gold)' }}>
                <Package size={17} />
              </div>
            </div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              {stats.totalProducts}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Catalog items</span>
          </div>

          {/* Card 2: Customer Orders Count */}
          <div className="glass-card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Customer Orders
              </span>
              <div style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)', background: 'rgba(212, 163, 115, 0.15)', color: 'var(--accent-gold)' }}>
                <ShoppingBag size={17} />
              </div>
            </div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent-gold)' }}>
              {orders.length}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Commissions placed</span>
          </div>

          {/* Card 3: Total Revenue */}
          <div className="glass-card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Total Revenue
              </span>
              <div style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)', background: 'rgba(122, 158, 126, 0.15)', color: 'var(--accent-sage)' }}>
                <DollarSign size={17} />
              </div>
            </div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#8bd396' }}>
              ${Number(stats.totalRevenue || 0).toLocaleString()}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>From real customer orders</span>
          </div>

          {/* Card 4: Low Stock Alerts */}
          <div className="glass-card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Low Stock
              </span>
              <div style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-warning)' }}>
                <AlertCircle size={17} />
              </div>
            </div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: stats.lowStock > 0 ? '#fbbf24' : 'var(--text-primary)' }}>
              {stats.lowStock}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>&le; 10 units left</span>
          </div>
        </div>
      )}

      {/* 2. Navigation Tabs (Products vs Customer Orders) */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid var(--border-medium)',
          marginBottom: '2rem'
        }}
      >
        <button
          onClick={() => setActiveTab('products')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'products' ? 'var(--accent-gold)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'products' ? '2px solid var(--accent-gold)' : '2px solid transparent',
            transition: 'all var(--transition-fast)'
          }}
        >
          <Package size={17} />
          <span>Product Inventory ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'orders' ? 'var(--accent-gold)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'orders' ? '2px solid var(--accent-gold)' : '2px solid transparent',
            transition: 'all var(--transition-fast)'
          }}
        >
          <ShoppingBag size={17} />
          <span>Customer Orders ({orders.length})</span>
          {orders.length > 0 && (
            <span
              style={{
                background: 'var(--accent-gold)',
                color: '#0d0f14',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '0.1rem 0.45rem',
                borderRadius: 'var(--radius-full)'
              }}
            >
              {orders.length}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================
          TAB 1: PRODUCTS INVENTORY MANAGEMENT
          ======================================================== */}
      {activeTab === 'products' && (
        <div>
          {/* Search & Filter Bar */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '240px' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
                <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by title or model..."
                  style={{ width: '100%', paddingLeft: '2.4rem', paddingRight: '1rem', fontSize: '0.85rem' }}
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ fontSize: '0.85rem', height: '40px' }}
              >
                <option value="all">All Departments</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing <strong>{filteredProducts.length}</strong> items
            </div>
          </div>

          {/* Products Data Table */}
          <div
            className="glass-card"
            style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              border: '1px solid var(--border-medium)'
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem', gap: '0.75rem', color: 'var(--accent-gold)' }}>
                <Loader2 className="animate-spin" size={24} />
                <span>Loading catalog items...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                <Package size={40} color="var(--border-medium)" style={{ marginBottom: '1rem' }} />
                <p>No products match the selected filters.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      <th style={{ padding: '1rem 1.25rem' }}>Product</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Category</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Price</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Stock</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Featured</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => {
                      const isOutOfStock = p.stock_quantity <= 0;
                      const isLowStock = p.stock_quantity > 0 && p.stock_quantity <= 10;

                      return (
                        <tr
                          key={p.id}
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            transition: 'background var(--transition-fast)'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-hover)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <img
                                src={p.image_url}
                                alt={p.title}
                                style={{
                                  width: '46px',
                                  height: '46px',
                                  borderRadius: 'var(--radius-sm)',
                                  objectFit: 'cover',
                                  border: '1px solid var(--border-subtle)'
                                }}
                              />
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {p.title}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  ID: {p.id.substring(0, 14)}...
                                </div>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '1rem 1.25rem' }}>
                            <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                              {p.category_name}
                            </span>
                          </td>

                          <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                            ${Number(p.price).toFixed(2)}
                          </td>

                          <td style={{ padding: '1rem 1.25rem' }}>
                            <span
                              className={`badge ${isOutOfStock ? 'badge-out-stock' : isLowStock ? 'badge-low-stock' : 'badge-stock'}`}
                              style={{ fontSize: '0.72rem' }}
                            >
                              {p.stock_quantity} units
                            </span>
                          </td>

                          <td style={{ padding: '1rem 1.25rem' }}>
                            {p.is_featured ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--accent-gold)' }}>
                                <Sparkles size={13} /> Featured
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Standard</span>
                            )}
                          </td>

                          <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                              <button
                                onClick={() => handleOpenEditModal(p)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.4rem 0.6rem' }}
                                title="Edit product"
                              >
                                <Edit3 size={15} color="var(--accent-gold)" />
                              </button>
                              <button
                                onClick={() => setDeletingProduct(p)}
                                className="btn btn-danger btn-sm"
                                style={{ padding: '0.4rem 0.6rem' }}
                                title="Delete product"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: CUSTOMER ORDERS OVERSIGHT
          ======================================================== */}
      {activeTab === 'orders' && (
        <div>
          {/* Order Search & Status Filter */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
                <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder="Search customer, email, order ID..."
                  style={{ width: '100%', paddingLeft: '2.4rem', paddingRight: '1rem', fontSize: '0.85rem' }}
                />
              </div>

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                style={{ fontSize: '0.85rem', height: '40px' }}
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing <strong>{filteredOrders.length}</strong> customer orders
            </div>
          </div>

          {/* Customer Orders Table */}
          <div
            className="glass-card"
            style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              border: '1px solid var(--border-medium)'
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem', gap: '0.75rem', color: 'var(--accent-gold)' }}>
                <Loader2 className="animate-spin" size={24} />
                <span>Loading customer orders...</span>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                <ShoppingBag size={44} color="var(--border-medium)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  No customer orders found
                </h3>
                <p style={{ fontSize: '0.88rem' }}>
                  Orders placed by customers will be tracked and displayed here in real time.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      <th style={{ padding: '1rem 1.25rem' }}>Order ID & Date</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Customer</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Items Ordered</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Total Amount</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
                      const itemCount = (order.items || []).reduce((acc, it) => acc + (it.quantity || 1), 0);
                      const firstItem = order.items?.[0];

                      return (
                        <tr
                          key={order.id}
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            transition: 'background var(--transition-fast)'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-hover)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          {/* Order ID & Date */}
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: '0.92rem' }}>
                              #{order.id}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                              <Clock size={12} />
                              {new Date(order.created_at).toLocaleDateString()} &bull; {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>

                          {/* Customer Details */}
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {order.customer_name}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              {order.customer_email}
                            </div>
                          </td>

                          {/* Items Preview */}
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              {firstItem && (
                                <img
                                  src={firstItem.image_url}
                                  alt={firstItem.title}
                                  style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: 'var(--radius-sm)',
                                    objectFit: 'cover',
                                    border: '1px solid var(--border-subtle)'
                                  }}
                                />
                              )}
                              <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {firstItem?.title || 'Acoustic Product'}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  {itemCount} {itemCount === 1 ? 'unit' : 'units'} total {order.items?.length > 1 && `(${order.items.length} products)`}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Total */}
                          <td style={{ padding: '1rem 1.25rem', fontWeight: 800, color: 'var(--accent-gold)', fontSize: '1.05rem' }}>
                            ${Number(order.total).toFixed(2)}
                          </td>

                          {/* Status Dropdown */}
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <select
                              value={order.status || 'confirmed'}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              style={{
                                fontSize: '0.78rem',
                                padding: '0.35rem 0.65rem',
                                borderRadius: 'var(--radius-full)',
                                height: '32px',
                                background:
                                  order.status === 'delivered'
                                    ? 'rgba(122, 158, 126, 0.2)'
                                    : order.status === 'dispatched'
                                    ? 'rgba(59, 130, 246, 0.2)'
                                    : 'rgba(212, 163, 115, 0.2)',
                                color:
                                  order.status === 'delivered'
                                    ? '#8bd396'
                                    : order.status === 'dispatched'
                                    ? '#60a5fa'
                                    : 'var(--accent-gold)',
                                borderColor: 'var(--border-subtle)',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="dispatched">Dispatched</option>
                              <option value="delivered">Delivered</option>
                            </select>
                          </td>

                          {/* Action Button: View Full Order Modal */}
                          <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                            <button
                              onClick={() => setViewingOrder(order)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.4rem 0.75rem' }}
                            >
                              <Eye size={15} color="var(--accent-gold)" />
                              <span>Inspect</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 1: Product Add/Edit */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
        categories={categories}
      />

      {/* Modal 2: Product Delete Confirm */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteConfirm}
        productTitle={deletingProduct?.title || ''}
        isDeleting={isDeleting}
      />

      {/* Modal 3: Order Details Inspector */}
      {viewingOrder && (
        <div className="modal-overlay" onClick={() => setViewingOrder(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '640px', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <div>
                <span className="badge badge-gold" style={{ marginBottom: '0.3rem' }}>
                  Commission Record
                </span>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                  Order #{viewingOrder.id}
                </h2>
              </div>
              <button onClick={() => setViewingOrder(null)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Customer Details Box */}
            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                marginBottom: '1.5rem'
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Customer
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {viewingOrder.customer_name}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--accent-gold)' }}>
                    {viewingOrder.customer_email}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Commission Status
                  </div>
                  <div style={{ marginTop: '0.35rem' }}>
                    <select
                      value={viewingOrder.status}
                      onChange={(e) => handleUpdateOrderStatus(viewingOrder.id, e.target.value)}
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="dispatched">Dispatched</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                </div>
              </div>

              {viewingOrder.shipping_address && (
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Destination Address
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {viewingOrder.shipping_address.street || 'Studio Address'}, {viewingOrder.shipping_address.city || ''}, {viewingOrder.shipping_address.country || 'USA'}
                  </div>
                </div>
              )}
            </div>

            {/* Itemized Products */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.75rem' }}>
                Purchased Equipment ({viewingOrder.items?.length || 0})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {viewingOrder.items?.map((it, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <img
                      src={it.image_url}
                      alt={it.title}
                      style={{ width: '45px', height: '45px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {it.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Quantity: <strong>{it.quantity}</strong> &bull; Unit Price: ${Number(it.price).toFixed(2)}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
                      ${Number(it.price * it.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Financials */}
            <div
              style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline'
              }}
            >
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Subtotal: ${Number(viewingOrder.subtotal || 0).toFixed(2)} &bull; Freight: ${Number(viewingOrder.shipping || 0).toFixed(2)} &bull; Tax: ${Number(viewingOrder.tax || 0).toFixed(2)}</span>
              </div>
              <div>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                  Total: ${Number(viewingOrder.total).toFixed(2)} USD
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
