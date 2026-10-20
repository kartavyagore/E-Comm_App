import React from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';

export const CartDrawer = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    updateQuantity,
    removeFromCart,
    subtotal,
    itemCount,
    freeShippingThreshold,
    freeShippingProgress
  } = useCart();

  if (!isCartOpen) return null;

  const neededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(6px)',
        animation: 'fadeIn 200ms ease'
      }}
      onClick={() => setIsCartOpen(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-medium)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideInRight 250ms cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={20} color="var(--accent-gold)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
              Cart ({itemCount})
            </h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            style={{
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Tracker */}
        <div
          style={{
            padding: '0.85rem 1.5rem',
            background: 'var(--bg-surface-elevated)',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
            <Truck size={14} color="var(--accent-gold)" />
            {neededForFreeShipping > 0 ? (
              <span>
                Add <strong style={{ color: 'var(--accent-gold)' }}>${neededForFreeShipping.toFixed(2)}</strong> more for Free Insured Global Shipping
              </span>
            ) : (
              <span style={{ color: '#8bd396', fontWeight: 600 }}>
                ✓ You have qualified for Free Insured Global Freight!
              </span>
            )}
          </div>
          <div
            style={{
              width: '100%',
              height: '5px',
              borderRadius: '3px',
              background: 'rgba(255, 255, 255, 0.08)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${freeShippingProgress}%`,
                height: '100%',
                background: freeShippingProgress >= 100 ? 'var(--accent-sage)' : 'var(--accent-gold)',
                transition: 'width 300ms ease'
              }}
            />
          </div>
        </div>

        {/* Item List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
          {cartItems.length === 0 ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: 'var(--text-muted)',
                gap: '1rem'
              }}
            >
              <ShoppingBag size={48} strokeWidth={1.5} color="var(--border-medium)" />
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Your studio cart is empty</p>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsCartOpen(false)}
              >
                Explore Acoustic Catalog
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    paddingBottom: '1.25rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    alignItems: 'center'
                  }}
                >
                  <img
                    src={item.image_url}
                    alt={item.title}
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: 'var(--radius-md)',
                      objectFit: 'cover',
                      border: '1px solid var(--border-subtle)'
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      ${item.price} each
                    </div>

                    {/* Quantity Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-surface-elevated)'
                        }}
                      >
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{
                            padding: '0.2rem 0.5rem',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: '24px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{
                            padding: '0.2rem 0.5rem',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{ color: 'var(--accent-danger)', padding: '0.3rem', display: 'flex' }}
                        aria-label="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: '0.95rem' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer with Subtotal & Actions */}
        {cartItems.length > 0 && (
          <div
            style={{
              padding: '1.5rem',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-elevated)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              <span>Subtotal</span>
              <span style={{ color: 'var(--accent-gold)', fontSize: '1.15rem' }}>
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Taxes and freight calculated dynamically at checkout. Prices verified with acoustic archive.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                to="/cart"
                onClick={() => setIsCartOpen(false)}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                <span>View Full Cart & Checkout</span>
                <ArrowRight size={16} />
              </Link>
              <button
                onClick={() => setIsCartOpen(false)}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%' }}
              >
                Continue Browsing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
