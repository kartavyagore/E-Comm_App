import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Clock, Package, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { orderService } from '../services/orderService.js';
import { useAuth } from '../context/AuthContext.jsx';

export const CustomerOrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await orderService.getMyOrders();
        setOrders(res?.orders || res?.data?.orders || []);
      } catch (err) {
        console.error('Failed to load customer orders:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '6rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
          Customer Studio Archive
        </span>
        <h1 className="heading-display" style={{ fontSize: '2.4rem' }}>
          My Commissions & Orders
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Track your allocated acoustic transducers and dispatch status.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', gap: '0.75rem', color: 'var(--accent-gold)' }}>
          <Loader2 className="animate-spin" size={24} />
          <span>Loading your acoustic commissions...</span>
        </div>
      ) : orders.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '5rem 2rem',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            maxWidth: '520px',
            margin: '2rem auto'
          }}
        >
          <ShoppingBag size={48} color="var(--border-medium)" style={{ marginBottom: '1.25rem' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            No commissions on record yet
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            Explore our collection of planar headphones and studio monitors to commission your first transducer.
          </p>
          <Link to="/shop" className="btn btn-primary">
            <span>Browse Acoustic Catalog</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => (
            <div
              key={order.id}
              className="glass-card"
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem',
                border: '1px solid var(--border-medium)'
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Commission Reference
                  </span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                    #{order.id}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                    <Clock size={12} />
                    {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    className={`badge ${
                      order.status === 'delivered'
                        ? 'badge-stock'
                        : order.status === 'dispatched'
                        ? 'badge-gold'
                        : 'badge-gold'
                    }`}
                    style={{ textTransform: 'uppercase', fontWeight: 700 }}
                  >
                    {order.status || 'Confirmed'}
                  </span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.3rem' }}>
                    ${Number(order.total).toFixed(2)} USD
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {order.items?.map((it, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.6rem 0'
                    }}
                  >
                    <img
                      src={it.image_url}
                      alt={it.title}
                      style={{ width: '45px', height: '45px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                        {it.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Quantity: <strong>{it.quantity}</strong> &bull; ${Number(it.price).toFixed(2)} each
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
                      ${Number(it.price * it.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
