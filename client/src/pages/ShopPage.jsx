import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown, X, Loader2 } from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard.jsx';
import { productService } from '../services/productService.js';

export const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Read URL query params
  const categoryParam = searchParams.get('category') || 'all';
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // Local search input
  const [searchInput, setSearchInput] = useState(searchParam);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await productService.getCategories();
        setCategories(res.categories || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch products when query params change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productService.getProducts({
          category: categoryParam,
          search: searchParam,
          sort: sortParam,
          page: pageParam,
          limit: 12
        });
        setProducts(res.products || []);
        setTotal(res.total || 0);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryParam, searchParam, sortParam, pageParam]);

  // Sync search input if URL changes externally
  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  const updateParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    nextParams.delete('page'); // Reset to page 1 on filter change
    setSearchParams(nextParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="heading-display" style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>
          Acoustic Transducers & Archive
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Explore our complete catalog of planar headphones, nearfield studio monitors, and precision acoustic gear.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          marginBottom: '2.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => updateParam('category', 'all')}
            className={`btn btn-sm ${categoryParam === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            All Archive
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParam('category', cat.slug || cat.id)}
              className={`btn btn-sm ${categoryParam === (cat.slug || cat.id) ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Right: Search & Sort Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '220px' }}>
            <Search
              size={15}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Filter catalog..."
              style={{
                width: '100%',
                paddingLeft: '2.2rem',
                paddingRight: '1rem',
                paddingTop: '0.45rem',
                paddingBottom: '0.45rem',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-md)'
              }}
            />
          </form>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowUpDown size={15} color="var(--accent-gold)" />
            <select
              value={sortParam}
              onChange={(e) => updateParam('sort', e.target.value)}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-md)',
                height: '38px',
                cursor: 'pointer'
              }}
            >
              <option value="newest">Newest Releases</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Indicators */}
      {(categoryParam !== 'all' || searchParam) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active filters:</span>
          {categoryParam !== 'all' && (
            <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              Category: {categories.find((c) => (c.slug || c.id) === categoryParam)?.name || categoryParam}
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => updateParam('category', 'all')} />
            </span>
          )}
          {searchParam && (
            <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              Search: "{searchParam}"
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => updateParam('search', '')} />
            </span>
          )}
          <button
            onClick={clearAllFilters}
            style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', textDecoration: 'underline' }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Catalog Results Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', gap: '0.75rem', color: 'var(--accent-gold)' }}>
          <Loader2 className="animate-spin" size={24} />
          <span>Curating acoustic items...</span>
        </div>
      ) : products.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '5rem 2rem',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            maxWidth: '540px',
            margin: '2rem auto'
          }}
        >
          <Search size={40} color="var(--border-medium)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            No matching gear found
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            We couldn't find any acoustic hardware matching your criteria. Try adjusting your search term or clearing filters.
          </p>
          <button onClick={clearAllFilters} className="btn btn-primary">
            Reset All Filters
          </button>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Showing <strong>{products.length}</strong> of <strong>{total}</strong> crafted instruments
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem'
            }}
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
