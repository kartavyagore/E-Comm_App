import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  User,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  Sliders,
  ChevronDown,
  Volume2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { productService } from '../../services/productService.js';

export const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const searchContainerRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Handle sticky scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setShowSearchDropdown(false);
  }, [location.pathname]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await productService.getProducts({ search: searchQuery.trim(), limit: 4 });
        setSearchResults(res.products || []);
        setShowSearchDropdown(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
        backgroundColor: isScrolled ? 'rgba(10, 12, 16, 0.92)' : 'rgba(10, 12, 16, 0.75)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${isScrolled ? 'var(--border-medium)' : 'var(--border-subtle)'}`,
        transition: 'all var(--transition-normal)'
      }}
    >
      <div
        className="container"
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem'
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #d4a373, #a26b38)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-gold)'
            }}
          >
            <Volume2 size={20} color="#0d0f14" strokeWidth={2.5} />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.25rem',
                letterSpacing: '0.08em',
                color: 'var(--text-primary)',
                display: 'block',
                lineHeight: 1.1
              }}
            >
              AURA
            </span>
            <span
              style={{
                fontSize: '0.65rem',
                letterSpacing: '0.22em',
                color: 'var(--accent-gold)',
                textTransform: 'uppercase',
                fontWeight: 600
              }}
            >
              Sound & Living
            </span>
          </div>
        </Link>

        {/* Navigation Links - Desktop */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '2rem',
            fontSize: '0.9rem',
            fontWeight: 500,
            letterSpacing: '0.02em',
            color: 'var(--text-secondary)'
          }}
          className="desktop-nav"
        >
          <Link
            to="/shop"
            style={{
              color: location.pathname === '/shop' ? 'var(--accent-gold)' : 'inherit',
              transition: 'color var(--transition-fast)'
            }}
          >
            Collection
          </Link>
          <Link
            to="/shop?category=spatial-audio"
            style={{ transition: 'color var(--transition-fast)' }}
          >
            Spatial Audio
          </Link>
          <Link
            to="/shop?category=studio-monitors"
            style={{ transition: 'color var(--transition-fast)' }}
          >
            Studio Monitors
          </Link>
          <Link
            to="/shop?category=acoustic-gear-dacs"
            style={{ transition: 'color var(--transition-fast)' }}
          >
            Acoustic & DACs
          </Link>
        </nav>

        {/* Search Bar with Live Suggestions */}
        <div
          ref={searchContainerRef}
          style={{
            position: 'relative',
            flex: '1',
            maxWidth: '380px',
            display: 'none'
          }}
          className="desktop-search"
        >
          <form onSubmit={handleSearchSubmit}>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Search
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '1rem', pointerEvents: 'none' }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowSearchDropdown(true);
                }}
                placeholder="Search studio headphones, monitors..."
                style={{
                  width: '100%',
                  paddingLeft: '2.5rem',
                  paddingRight: '1rem',
                  paddingTop: '0.6rem',
                  paddingBottom: '0.6rem',
                  fontSize: '0.85rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-surface-elevated)'
                }}
              />
            </div>
          </form>

          {/* Live Search Suggestions Dropdown */}
          {showSearchDropdown && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
                zIndex: 100
              }}
            >
              {searchResults.length > 0 ? (
                <div>
                  <div
                    style={{
                      padding: '0.6rem 1rem',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--text-muted)',
                      borderBottom: '1px solid var(--border-subtle)'
                    }}
                  >
                    Catalog Matches
                  </div>
                  {searchResults.map((item) => (
                    <Link
                      key={item.id}
                      to={`/product/${item.slug || item.id}`}
                      onClick={() => setShowSearchDropdown(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid var(--border-subtle)',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'background var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <img
                        src={item.image_url}
                        alt={item.title}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: 'var(--radius-sm)',
                          objectFit: 'cover'
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {item.category_name}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: '0.9rem' }}>
                        ${item.price}
                      </div>
                    </Link>
                  ))}
                  <div
                    onClick={handleSearchSubmit}
                    style={{
                      padding: '0.65rem 1rem',
                      fontSize: '0.8rem',
                      textAlign: 'center',
                      color: 'var(--accent-gold)',
                      cursor: 'pointer',
                      background: 'rgba(212, 163, 115, 0.05)'
                    }}
                  >
                    View all results for "{searchQuery}" →
                  </div>
                </div>
              ) : (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No matching acoustic gear found.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions: Auth, Cart, Mobile Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* User Account / Auth Dropdown */}
          <div ref={userDropdownRef} style={{ position: 'relative' }}>
            {user ? (
              <div>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.4rem 0.8rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: isAdmin ? 'var(--accent-gold)' : 'var(--accent-sage)',
                      color: '#0d0f14',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800
                    }}
                  >
                    {user.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.full_name?.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} color="var(--text-muted)" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: '220px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      overflow: 'hidden',
                      zIndex: 100,
                      animation: 'scaleUp 180ms ease'
                    }}
                  >
                    <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.full_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                      <div style={{ marginTop: '0.4rem' }}>
                        <span className={`badge ${isAdmin ? 'badge-gold' : 'badge-stock'}`} style={{ fontSize: '0.65rem' }}>
                          {isAdmin ? 'Store Admin' : 'Customer'}
                        </span>
                      </div>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.75rem 1rem',
                          fontSize: '0.85rem',
                          color: 'var(--accent-gold)',
                          fontWeight: 600,
                          borderBottom: '1px solid var(--border-subtle)'
                        }}
                      >
                        <Sliders size={16} />
                        Admin Dashboard
                      </Link>
                    )}

                    {!isAdmin && (
                      <Link
                        to="/my-orders"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.75rem 1rem',
                          fontSize: '0.85rem',
                          color: 'var(--text-primary)',
                          fontWeight: 500,
                          borderBottom: '1px solid var(--border-subtle)'
                        }}
                      >
                        <ShoppingBag size={16} color="var(--accent-gold)" />
                        My Commissions
                      </Link>
                    )}

                    <button
                      onClick={() => logout(true)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.75rem 1rem',
                        fontSize: '0.85rem',
                        color: 'var(--accent-danger)',
                        textAlign: 'left'
                      }}
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="btn btn-secondary btn-sm"
                style={{ borderRadius: 'var(--radius-full)', padding: '0.45rem 1rem' }}
              >
                <User size={15} />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Cart Trigger with Glow Badge */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Open Shopping Cart"
            style={{
              position: 'relative',
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              transition: 'all var(--transition-fast)'
            }}
          >
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--accent-gold)',
                  color: '#0d0f14',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 10px rgba(212, 163, 115, 0.6)'
                }}
              >
                {itemCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              padding: '0.4rem'
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-subtle)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            animation: 'fadeIn 200ms ease'
          }}
        >
          <form onSubmit={handleSearchSubmit}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '1rem' }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search collection..."
                style={{
                  width: '100%',
                  paddingLeft: '2.5rem',
                  borderRadius: 'var(--radius-full)'
                }}
              />
            </div>
          </form>

          <Link to="/shop" style={{ fontSize: '1rem', fontWeight: 600 }}>
            All Collection
          </Link>
          <Link to="/shop?category=spatial-audio" style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
            Spatial Audio
          </Link>
          <Link to="/shop?category=studio-monitors" style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
            Studio Monitors
          </Link>
          <Link to="/shop?category=acoustic-gear-dacs" style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
            Acoustic & DACs
          </Link>
          {isAdmin && (
            <Link to="/admin" style={{ fontSize: '1rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
              Admin Dashboard
            </Link>
          )}
        </div>
      )}

      {/* Responsive Inline CSS for Desktop vs Mobile */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .desktop-search { display: block !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </header>
  );
};
