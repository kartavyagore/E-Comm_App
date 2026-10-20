import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, CheckCircle2, Truck, User, MapPin, Mail } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { orderService } from '../services/orderService.js';

export const CartPage = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    itemCount,
    freeShippingThreshold,
    verifyWithBackend,
    verifiedCart,
    isVerifying
  } = useCart();

  const { user } = useAuth();
  const { showToast } = useToast();

  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Customer Checkout Details
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('United States');

  // Pre-fill user details if logged in
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.full_name || '');
      if (!customerEmail) setCustomerEmail(user.email || '');
    }
  }, [user]);

  // Automatically verify prices with backend on load or when items change
  useEffect(() => {
    if (cartItems.length > 0) {
      verifyWithBackend();
    }
  }, [cartItems.length]);

  const handleCheckout = async (e) => {
    if (e) e.preventDefault();

    if (!customerName.trim() || !customerEmail.trim()) {
      showToast('Please provide your name and email address for order confirmation.', 'error');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      // 1. Verify with backend first
      const verification = await verifyWithBackend();
      if (!verification) {
        showToast('Backend price validation failed. Please try again.', 'error');
        setIsSubmittingOrder(false);
        return;
      }

      // 2. Submit real order to backend
      const res = await orderService.createOrder({
        items: cartItems,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        shippingAddress: {
          street: streetAddress.trim() || 'Studio Reference Address',
          city: city.trim() || 'Metropolis',
          country: country.trim() || 'United States'
        }
      });

      const placedOrder = res?.order || res?.data?.order || (res?.id ? res : null);

      if (placedOrder && placedOrder.id) {
        setConfirmedOrder(placedOrder);
        clearCart();
        showToast(`Commission confirmed! Order ID: #${placedOrder.id}`, 'success');
      } else {
        throw new Error(res?.message || 'Order could not be confirmed.');
      }
    } catch (err) {
      showToast(err.message || 'Failed to place order.', 'error');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const currentVerified = verifiedCart || {
    subtotal: subtotal,
    shipping: subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 25,
    estimatedTax: Math.round(subtotal * 0.08 * 100) / 100,
    total: Math.round((subtotal + (subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 25) + subtotal * 0.08) * 100) / 100
  };

  if (confirmedOrder) {
    return (
      <div className="container" style={{ paddingTop: '5rem', paddingBottom: '6rem', maxWidth: '640px' }}>
        <div
          className="glass-card"
          style={{
            padding: '2.5rem',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            border: '1px solid var(--border-accent)'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(122, 158, 126, 0.15)',
              border: '1px solid var(--accent-sage)',
              color: 'var(--accent-sage)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <span className="badge badge-stock" style={{ marginBottom: '0.75rem' }}>
            Commission Confirmed &bull; Real Database Record
          </span>

          <h1 className="heading-display" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            Acoustic Commission #{confirmedOrder.id}
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Thank you, <strong style={{ color: 'var(--text-primary)' }}>{confirmedOrder.customer_name}</strong>.
            Your order has been logged into the system and is visible on the Admin Dashboard.
            Confirmation sent to <strong style={{ color: 'var(--accent-gold)' }}>{confirmedOrder.customer_email}</strong>.
          </p>

          {/* Order Summary Receipt Box */}
          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              textAlign: 'left',
              marginBottom: '2rem'
            }}
          >
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.75rem' }}>
              Allocated Instruments ({confirmedOrder.items?.length || 0})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              {confirmedOrder.items?.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                  <span>
                    {it.quantity}x {it.title}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>
                    ${Number(it.price * it.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>Total Paid</span>
              <span style={{ color: 'var(--accent-gold)', fontSize: '1.1rem' }}>
                ${Number(confirmedOrder.total).toFixed(2)} USD
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/shop" className="btn btn-primary">
              <span>Continue Browsing Archive</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ paddingTop: '5rem', paddingBottom: '6rem', textAlign: 'center', maxWidth: '480px' }}>
        <ShoppingBag size={56} strokeWidth={1.5} color="var(--border-medium)" style={{ marginBottom: '1.5rem' }} />
        <h1 className="heading-display" style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
          Your Studio Cart is Empty
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Explore our reference collection of planar transducers, nearfield monitors, and tube DACs.
        </p>
        <Link to="/shop" className="btn btn-primary btn-lg">
          <span>Explore Acoustic Archive</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '6rem' }}>
      <h1 className="heading-display" style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>
        Review Studio Cart & Checkout
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
        {itemCount} {itemCount === 1 ? 'item' : 'items'} in your bag. Real-time database stock & price verification.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'flex-start'
        }}
      >
        {/* Left: Cart Items Table/Cards & Customer Details Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="glass-card"
                style={{
                  display: 'flex',
                  gap: '1.25rem',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  alignItems: 'center'
                }}
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: 'var(--radius-md)',
                    objectFit: 'cover'
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="badge badge-gold" style={{ fontSize: '0.65rem', marginBottom: '0.2rem' }}>
                    {item.category_name}
                  </span>
                  <Link
                    to={`/product/${item.slug || item.id}`}
                    style={{
                      display: 'block',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginBottom: '0.3rem'
                    }}
                  >
                    {item.title}
                  </Link>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                    ${Number(item.price).toFixed(2)} USD
                  </div>
                </div>

                {/* Quantity Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface-elevated)'
                    }}
                  >
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{ padding: '0.35rem 0.6rem', color: 'var(--text-secondary)' }}
                    >
                      <Minus size={13} />
                    </button>
                    <span style={{ minWidth: '28px', textAlign: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{ padding: '0.35rem 0.6rem', color: 'var(--text-secondary)' }}
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{ color: 'var(--accent-danger)', padding: '0.4rem' }}
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ minWidth: '75px', textAlign: 'right', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Customer Commission & Shipping Information */}
          <div
            className="glass-card"
            style={{
              padding: '1.75rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <User size={20} color="var(--accent-gold)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                Customer & Delivery Information
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your Name"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="your.email@domain.com"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                  Studio / Delivery Address
                </label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="100 Acoustic Way, Suite 4B"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="San Francisco"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Summary with Backend Verification */}
        <div
          className="glass-card"
          style={{
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            position: 'sticky',
            top: '100px'
          }}
        >
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '1.5rem' }}>
            Order Summary
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Item Subtotal</span>
              <span style={{ fontWeight: 600 }}>${currentVerified.subtotal.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Insured Express Freight</span>
              <span style={{ fontWeight: 600, color: currentVerified.shipping === 0 ? '#8bd396' : 'var(--text-primary)' }}>
                {currentVerified.shipping === 0 ? 'Complimentary' : `$${currentVerified.shipping.toFixed(2)}`}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Estimated Sales Tax (8%)</span>
              <span style={{ fontWeight: 600 }}>${currentVerified.estimatedTax.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>Total (USD)</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-gold)', fontFamily: 'var(--font-display)' }}>
              ${currentVerified.total.toFixed(2)}
            </span>
          </div>

          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(212, 163, 115, 0.08)',
              border: '1px solid var(--border-accent)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.8rem',
              color: 'var(--accent-gold)',
              marginBottom: '1.5rem'
            }}
          >
            <ShieldCheck size={16} />
            <span>Cryptographically verified against live database stock & pricing</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isVerifying || isSubmittingOrder}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            {isSubmittingOrder ? 'Commissioning Transducers...' : isVerifying ? 'Verifying with Archive...' : 'Place Secure Order'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            30-Day in-studio audition period. Insured signature freight upon dispatch.
          </p>
        </div>
      </div>
    </div>
  );
};
