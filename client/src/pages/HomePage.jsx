import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Headphones,
  Sliders,
  Shield,
  Layers,
  Award,
  Zap,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard.jsx';
import { productService } from '../services/productService.js';

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          productService.getFeaturedProducts(),
          productService.getCategories()
        ]);
        setFeaturedProducts(prodRes?.products || []);
        setCategories(catRes?.categories || []);
      } catch (err) {
        console.error('Failed to load homepage assets:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem', paddingBottom: '3rem' }}>
      {/* 1. Hero Section */}
      <section
        style={{
          position: 'relative',
          paddingTop: '3.5rem',
          paddingBottom: '4.5rem',
          overflow: 'hidden'
        }}
      >
        {/* Ambient Gradient Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '450px',
            background: 'radial-gradient(circle, rgba(212, 163, 115, 0.12) 0%, rgba(10, 12, 16, 0) 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3.5rem',
              alignItems: 'center'
            }}
          >
            {/* Left Column: Editorial Headline & CTAs */}
            <div>
              <div
                className="badge badge-gold"
                style={{ marginBottom: '1.25rem', gap: '0.4rem' }}
              >
                <Sparkles size={13} />
                <span>Next-Gen Planar Transducers</span>
              </div>

              <h1
                className="heading-display"
                style={{
                  fontSize: 'clamp(2.4rem, 5vw, 4rem)',
                  lineHeight: 1.08,
                  marginBottom: '1.5rem',
                  letterSpacing: '-0.03em'
                }}
              >
                Acoustic Purity. <br />
                <span style={{ color: 'var(--accent-gold)' }}>Architectural Form.</span>
              </h1>

              <p
                style={{
                  fontSize: '1.1rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '2.25rem',
                  maxWidth: '540px'
                }}
              >
                Zero-compromise audio hardware designed for surgical studio mastering and pure analog bliss. Crafted with aerospace-grade 6061 billet aluminum and solid American walnut.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                <Link to="/shop" className="btn btn-primary btn-lg">
                  <span>Explore Collection</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/shop?category=spatial-audio" className="btn btn-secondary btn-lg">
                  <span>Spatial Audio</span>
                </Link>
              </div>

              {/* Value stats */}
              <div
                style={{
                  display: 'flex',
                  gap: '2.5rem',
                  marginTop: '3rem',
                  paddingTop: '2rem',
                  borderTop: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                    90mm
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Planar Drivers
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                    &lt;0.0003%
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Total Harmonic Distortion
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                    3-Year
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Craft Warranty
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Showcase Visual */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-medium)',
                  boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)'
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80"
                  alt="AURA Obsidian Pro Wireless Planar Headphones"
                  style={{
                    width: '100%',
                    height: '460px',
                    objectFit: 'cover'
                  }}
                />

                {/* Floating Architectural Badge */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '1.25rem',
                    left: '1.25rem',
                    right: '1.25rem',
                    padding: '1rem 1.25rem',
                    background: 'rgba(10, 12, 16, 0.85)',
                    backdropFilter: 'blur(16px)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-gold)', letterSpacing: '0.08em', fontWeight: 700 }}>
                      Obsidian Pro Wireless
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Planar Magnetic Master Reference
                    </div>
                  </div>
                  <Link
                    to="/shop?category=spatial-audio"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'var(--accent-gold)',
                      color: '#0d0f14',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <ChevronRight size={20} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Curated Categories Grid */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
          <div>
            <div className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
              Architectural Lineup
            </div>
            <h2 className="heading-display" style={{ fontSize: '2rem' }}>
              Explore Categories
            </h2>
          </div>
          <Link
            to="/shop"
            style={{
              color: 'var(--accent-gold)',
              fontSize: '0.9rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <span>View All</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {categories.map((cat, idx) => {
            const catImages = [
              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1584679109597-c656b19974c9?auto=format&fit=crop&w=800&q=80"
            ];
            const imgUrl = catImages[idx % catImages.length];

            return (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug || cat.id}`}
                className="glass-card"
                style={{
                  position: 'relative',
                  height: '240px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '1.5rem',
                  textDecoration: 'none'
                }}
              >
                <img
                  src={imgUrl}
                  alt={cat.name}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'brightness(0.55)',
                    transition: 'transform 500ms ease, filter 500ms ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.08)';
                    e.currentTarget.style.filter = 'brightness(0.7)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.filter = 'brightness(0.55)';
                  }}
                />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: '0.35rem'
                    }}
                  >
                    {cat.name}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {cat.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Featured Masterpiece Collection */}
      <section className="container">
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem auto' }}>
          <div className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
            Reference Standard
          </div>
          <h2 className="heading-display" style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>
            Featured Masterpieces
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Each transducer is individually measured, curve-matched, and packaged with its serialized acoustic certificate.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--accent-gold)' }}>
            Loading acoustic collection...
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem'
            }}
          >
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link to="/shop" className="btn btn-secondary btn-lg">
            <span>Browse Full Acoustic Catalog</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* 4. Acoustic Engineering & Craft Story */}
      <section
        id="story"
        style={{
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          paddingTop: '5rem',
          paddingBottom: '5rem'
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '4rem',
              alignItems: 'center'
            }}
          >
            <div style={{ position: 'relative' }}>
              <img
                src="https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80"
                alt="Craftsmanship in Solid Walnut"
                style={{
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-medium)',
                  boxShadow: 'var(--shadow-lg)',
                  width: '100%',
                  height: '420px',
                  objectFit: 'cover'
                }}
              />
            </div>

            <div>
              <div className="badge badge-gold" style={{ marginBottom: '1rem' }}>
                Engineering Manifesto
              </div>
              <h2
                className="heading-display"
                style={{ fontSize: '2.2rem', lineHeight: 1.2, marginBottom: '1.5rem' }}
              >
                Crafted for Truth, <br />
                Not Exaggeration.
              </h2>
              <p
                style={{
                  fontSize: '1rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  marginBottom: '1.5rem'
                }}
              >
                In an era of hyper-compressed audio and bloated artificial bass, AURA constructs acoustic hardware that honors the mastering engineer's original intent. We pair organic woods with cryogenic conductors for an expansive, holographic soundstage.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
                  <CheckCircle2 size={20} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      Billet 6061 Aerospace Aluminum
                    </strong>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Eliminates parasitic ear-cup resonance and provides lifetime structural endurance.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
                  <CheckCircle2 size={20} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      Hand-Matched Vacuum Tube Circuits
                    </strong>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Dual discrete triode topology offering natural second-order harmonic warmth.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
                  <CheckCircle2 size={20} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      Sustainable Solid Walnut Baffles
                    </strong>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      FSC-certified hardwoods precision CNC contoured for optimal acoustic diffusion.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Limited Edition Promotional Banner */}
      <section className="container">
        <div
          style={{
            background: 'linear-gradient(135deg, #181d28 0%, #0d0f14 100%)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            padding: '3.5rem 2.5rem',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(212, 163, 115, 0.15) 0%, transparent 70%)',
              filter: 'blur(40px)',
              pointerEvents: 'none'
            }}
          />

          <span className="badge badge-gold" style={{ marginBottom: '1rem' }}>
            Studio Dispatch &bull; Limited Run
          </span>

          <h2
            className="heading-display"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', marginBottom: '1rem' }}
          >
            The Obsidian Collector’s Edition
          </h2>

          <p
            style={{
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              maxWidth: '580px',
              marginBottom: '2rem',
              lineHeight: 1.6
            }}
          >
            Includes custom 4.4mm cryogenic silver cable, milled aluminum stand, and serialized aluminum case. Worldwide insured freight included.
          </p>

          <Link to="/shop?category=spatial-audio" className="btn btn-primary btn-lg">
            <span>Explore Limited Edition</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};
