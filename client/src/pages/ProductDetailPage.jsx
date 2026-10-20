import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RefreshCw,
  Plus,
  Minus,
  Check,
  Loader2,
  Sliders,
  Sparkles
} from 'lucide-react';
import { productService } from '../services/productService.js';
import { useCart } from '../context/CartContext.jsx';
import { ProductCard } from '../components/product/ProductCard.jsx';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'warranty' | 'shipping'

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productService.getProductById(id);
        if (res?.product) {
          setProduct(res.product);
          setQuantity(1);

          // Fetch related products in same category
          const relRes = await productService.getProducts({
            category: res.product.category_id || res.product.category_name,
            limit: 3
          });
          setRelatedProducts((relRes.products || []).filter((p) => p.id !== res.product.id));
        } else {
          navigate('/shop');
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: '0.75rem', color: 'var(--accent-gold)' }}>
        <Loader2 className="animate-spin" size={28} />
        <span>Loading acoustic instrument...</span>
      </div>
    );
  }

  if (!product) return null;

  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <Link to="/" style={{ color: 'inherit' }}>Home</Link>
        <span>/</span>
        <Link to="/shop" style={{ color: 'inherit' }}>Shop</Link>
        <span>/</span>
        <span style={{ color: 'var(--accent-gold)' }}>{product.category_name}</span>
        <span>/</span>
        <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
          {product.title}
        </span>
      </div>

      {/* Main Product Showcase Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '3.5rem',
          alignItems: 'flex-start',
          marginBottom: '5rem'
        }}
      >
        {/* Left: Product Image Stage */}
        <div style={{ position: 'sticky', top: '100px' }}>
          <div
            className="glass-card"
            style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              background: 'linear-gradient(180deg, #161a24 0%, #0d0f14 100%)',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-lg)',
              padding: '1rem',
              textAlign: 'center'
            }}
          >
            <img
              src={product.image_url}
              alt={product.title}
              style={{
                width: '100%',
                maxHeight: '480px',
                objectFit: 'contain',
                borderRadius: 'var(--radius-md)'
              }}
            />
          </div>
        </div>

        {/* Right: Product Narrative & Commercials */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Category & Stock Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
              {product.category_name}
            </span>
            <span
              className={`badge ${isOutOfStock ? 'badge-out-stock' : isLowStock ? 'badge-low-stock' : 'badge-stock'}`}
            >
              {isOutOfStock ? 'Sold Out' : isLowStock ? `Only ${product.stock_quantity} Left in Archive` : `${product.stock_quantity} Units in Stock`}
            </span>
          </div>

          {/* Title */}
          <h1
            className="heading-display"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', lineHeight: 1.2 }}
          >
            {product.title}
          </h1>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', color: 'var(--accent-gold)' }}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < Math.floor(product.rating || 5) ? 'var(--accent-gold)' : 'none'}
                />
              ))}
            </div>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{Number(product.rating || 5.0).toFixed(1)}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              ({product.num_reviews || 24} Verified Studio Reviews)
            </span>
          </div>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-gold)', fontFamily: 'var(--font-display)' }}>
              ${Number(product.price).toFixed(2)}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>USD</span>
            {Number(product.price) >= 250 && (
              <span className="badge badge-stock" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>
                Free Insured Freight
              </span>
            )}
          </div>

          {/* Description */}
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {product.description}
          </p>

          {/* Quantity and Add to Cart Section */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
            {/* Quantity Selector */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                padding: '0.2rem'
              }}
            >
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={isOutOfStock || quantity <= 1}
                style={{ padding: '0.6rem 0.85rem', color: 'var(--text-secondary)' }}
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span style={{ minWidth: '36px', textAlign: 'center', fontWeight: 700, fontSize: '1rem' }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                disabled={isOutOfStock || quantity >= product.stock_quantity}
                style={{ padding: '0.6rem 0.85rem', color: 'var(--text-secondary)' }}
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="btn btn-primary btn-lg"
              style={{ flex: 1 }}
            >
              <ShoppingBag size={20} />
              <span>{isOutOfStock ? 'Currently Out of Stock' : `Add to Cart • $${(product.price * quantity).toFixed(2)}`}</span>
            </button>
          </div>

          {/* Security & Service Badges */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              marginTop: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Truck size={18} color="var(--accent-gold)" />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Dispatches within 24 hours
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShieldCheck size={18} color="var(--accent-gold)" />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                3-Year Factory Warranty
              </span>
            </div>
          </div>

          {/* Specifications & Documentation Tabs */}
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
              <button
                onClick={() => setActiveTab('specs')}
                style={{
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  borderBottom: activeTab === 'specs' ? '2px solid var(--accent-gold)' : '2px solid transparent',
                  color: activeTab === 'specs' ? 'var(--accent-gold)' : 'var(--text-secondary)'
                }}
              >
                Audio Specifications
              </button>
              <button
                onClick={() => setActiveTab('warranty')}
                style={{
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  borderBottom: activeTab === 'warranty' ? '2px solid var(--accent-gold)' : '2px solid transparent',
                  color: activeTab === 'warranty' ? 'var(--accent-gold)' : 'var(--text-secondary)'
                }}
              >
                Warranty & Returns
              </button>
            </div>

            {activeTab === 'specs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  Object.entries(product.specifications).map(([key, val]) => (
                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0',
                        borderBottom: '1px solid var(--border-subtle)',
                        fontSize: '0.88rem'
                      }}
                    >
                      <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {String(val)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Standard studio reference impedance (32 Ohms), balanced interconnects included.
                  </p>
                )}
              </div>
            )}

            {activeTab === 'warranty' && (
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Every AURA acoustic transducer is backed by our comprehensive 3-Year Craftsmanship Warranty covering drivers, circuitry, and assembly. If you are not completely spellbound by the acoustic presentation within 30 days, return it in original condition for a 100% refund.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products Rail */}
      {relatedProducts.length > 0 && (
        <div style={{ marginTop: '5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '4rem' }}>
          <h2 className="heading-display" style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>
            Complementary Acoustic Gear
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem'
            }}
          >
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
