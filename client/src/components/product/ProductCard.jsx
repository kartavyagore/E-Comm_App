import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  if (!product) return null;

  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;

  return (
    <div
      className="glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        position: 'relative',
        height: '100%'
      }}
    >
      {/* Image Container with Badges & Hover Zoom */}
      <Link
        to={`/product/${product.slug || product.id}`}
        style={{
          position: 'relative',
          display: 'block',
          width: '100%',
          paddingTop: '85%', // 1:0.85 aspect ratio
          background: 'linear-gradient(180deg, #161a24 0%, #0d0f14 100%)',
          overflow: 'hidden'
        }}
      >
        <img
          src={product.image_url}
          alt={product.title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 500ms cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
        />

        {/* Category Pill */}
        <span
          className="badge"
          style={{
            position: 'absolute',
            top: '0.85rem',
            left: '0.85rem',
            background: 'rgba(10, 12, 16, 0.75)',
            backdropFilter: 'blur(8px)',
            color: 'var(--text-secondary)',
            fontSize: '0.7rem'
          }}
        >
          {product.category_name}
        </span>

        {/* Stock Status Badge */}
        <span
          className={`badge ${isOutOfStock ? 'badge-out-stock' : isLowStock ? 'badge-low-stock' : 'badge-stock'}`}
          style={{
            position: 'absolute',
            top: '0.85rem',
            right: '0.85rem',
            fontSize: '0.68rem'
          }}
        >
          {isOutOfStock ? 'Out of Stock' : isLowStock ? `Only ${product.stock_quantity} Left` : 'In Stock'}
        </span>
      </Link>

      {/* Card Content */}
      <div
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          flex: 1
        }}
      >
        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
          <Star size={13} fill="var(--accent-gold)" color="var(--accent-gold)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {Number(product.rating || 5.0).toFixed(1)}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ({product.num_reviews || 12})
          </span>
        </div>

        {/* Title */}
        <Link
          to={`/product/${product.slug || product.id}`}
          style={{
            fontSize: '0.98rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            lineHeight: 1.4,
            marginBottom: '0.6rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {product.title}
        </Link>

        {/* Price & Action Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 'auto',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-subtle)'
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', lineHeight: 1 }}>
              Price
            </span>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
              ${Number(product.price).toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={isOutOfStock}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              background: isOutOfStock ? 'rgba(255,255,255,0.05)' : 'var(--bg-surface-elevated)'
            }}
            title={isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          >
            <ShoppingBag size={15} color={isOutOfStock ? 'var(--text-muted)' : 'var(--accent-gold)'} />
            <span style={{ fontSize: '0.8rem' }}>{isOutOfStock ? 'Sold Out' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
