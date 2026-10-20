import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Volume2, ShieldCheck, Truck, RefreshCw, Send, ArrowUpRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const { showToast } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      showToast('Thank you for subscribing to the AURA Acoustic Journal.', 'success');
      setEmail('');
    }
  };

  return (
    <footer
      style={{
        background: '#07080b',
        borderTop: '1px solid var(--border-subtle)',
        marginTop: 'auto',
        paddingTop: '4rem',
        paddingBottom: '2.5rem'
      }}
    >
      <div className="container">
        {/* Value Props Rail */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem',
            paddingBottom: '3.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '3.5rem'
          }}
        >
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold)'
              }}
            >
              <Truck size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Insured Global Freight
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Complimentary insured delivery on orders over $250.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold)'
              }}
            >
              <RefreshCw size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                30-Day Studio Audition
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Audition in your listening space. Hassle-free returns.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold)'
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                3-Year Craft Warranty
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Full warranty coverage against manufacturing defects.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '3rem',
            marginBottom: '3.5rem'
          }}
        >
          {/* Brand Info */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--accent-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Volume2 size={18} color="#0d0f14" />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  letterSpacing: '0.06em'
                }}
              >
                AURA
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Precision acoustic engineering meets architectural clarity. Crafted for discerning creators, mastering engineers, and audiophiles worldwide.
            </p>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Stockholm &bull; Tokyo &bull; San Francisco
            </div>
          </div>

          {/* Quick Links: Collection */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-primary)', marginBottom: '1.2rem' }}>
              Collection
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li><Link to="/shop?category=spatial-audio" style={{ transition: 'color var(--transition-fast)' }}>Planar Headphones</Link></li>
              <li><Link to="/shop?category=studio-monitors" style={{ transition: 'color var(--transition-fast)' }}>Active Studio Monitors</Link></li>
              <li><Link to="/shop?category=acoustic-gear-dacs" style={{ transition: 'color var(--transition-fast)' }}>Vacuum Tube DACs</Link></li>
              <li><Link to="/shop?category=desk-accessories" style={{ transition: 'color var(--transition-fast)' }}>Billet Aluminum Stands</Link></li>
              <li><Link to="/shop" style={{ transition: 'color var(--transition-fast)' }}>Complete Archive</Link></li>
            </ul>
          </div>

          {/* Quick Links: Philosophy & Support */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-primary)', marginBottom: '1.2rem' }}>
              Craft & Service
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li><a href="#story">Acoustic Philosophy</a></li>
              <li><a href="#story">Monocrystalline Conductors</a></li>
              <li><a href="#story">Sustainable American Walnut</a></li>
              <li><Link to="/cart">Cart & Checkout</Link></li>
              <li><Link to="/login">Account Portal</Link></li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div style={{ gridColumn: 'span 1' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-primary)', marginBottom: '1.2rem' }}>
              Acoustic Journal
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
              Receive exclusive private releases, frequency calibration profiles, and studio dispatches.
            </p>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="studio@domain.com"
                style={{ flex: 1, fontSize: '0.85rem', padding: '0.6rem 0.9rem' }}
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0.6rem 1rem' }}>
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} AURA Sound & Living Inc. All engineering rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
