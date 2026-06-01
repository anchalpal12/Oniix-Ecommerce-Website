import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/layout/Layout';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ui/ProductSkeleton';
import ScrollReveal from '../components/ui/ScrollReveal';
import usePageTitle from '../hooks/usePageTitle';
import useDebouncedValue from '../hooks/useDebouncedValue';
import { productApi, reviewApi } from '../api/client';
import { useCart } from '../context/CartContext';

const SORT_OPTIONS = [
  { value: '', label: 'Newest' },
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
  { value: 'name', label: 'A–Z' },
];

export default function Shop() {
  usePageTitle('Shop');
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addItem } = useCart();

  const debouncedSearch = useDebouncedValue(search, 350);
  const hasFilters = Boolean(debouncedSearch || category || sort);

  useEffect(() => {
    reviewApi.categories().then((res) => setCategories(res.data || [])).catch(() => {});
    productApi
      .list({ limit: 4, sort: 'price_desc' })
      .then((res) => setFeatured(res.data?.products || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    productApi
      .list({
        page,
        limit: 12,
        search: debouncedSearch || undefined,
        category: category || undefined,
        sort: sort || undefined,
      })
      .then((res) => {
        if (cancelled) return;
        setProducts(res.data.products || []);
        setPagination(res.data.pagination);
        setError('');
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [page, debouncedSearch, category, sort]);

  const activeFilters = useMemo(() => {
    const chips = [];
    if (category) chips.push({ key: 'category', label: category, clear: () => setCategory('') });
    if (debouncedSearch) chips.push({ key: 'search', label: `"${debouncedSearch}"`, clear: () => setSearch('') });
    if (sort) {
      const label = SORT_OPTIONS.find((o) => o.value === sort)?.label || sort;
      chips.push({ key: 'sort', label, clear: () => setSort('') });
    }
    return chips;
  }, [category, debouncedSearch, sort]);

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setSort('');
    setPage(1);
  };

  const showFeatured = !hasFilters && page === 1 && featured.length > 0;

  return (
    <Layout>
      <section className="page-hero page-hero--shop">
        <div className="page-hero-bg" style={{ backgroundImage: "url('/images/sec3.jpg')" }} />
        <div className="page-hero-overlay" />
        <div className="container page-hero-content page-hero-content--compact">
          <ScrollReveal>
            <p className="shop-hero-eyebrow">Onix catalog · {pagination?.total ?? '24+'} SKUs</p>
            <h1>Smart mining glasses &amp; safety eyewear</h1>
            <p>Enterprise-grade protection — rated frames, verified stock, secure checkout.</p>
            <div className="shop-hero-stats">
              <div className="shop-hero-stat">
                <strong>{categories.length || 5}</strong>
                <span>Categories</span>
              </div>
              <div className="shop-hero-stat">
                <strong>4.7★</strong>
                <span>Avg. rating</span>
              </div>
              <div className="shop-hero-stat">
                <strong>2–5d</strong>
                <span>Delivery</span>
              </div>
            </div>
            <div className="shop-hero-badges">
              <span className="shop-hero-badge">✓ ANSI / industrial rated</span>
              <span className="shop-hero-badge">✓ 30-day returns</span>
              <span className="shop-hero-badge">✓ COD · UPI · Card</span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="container section shop-page">
        <aside className="shop-filters" aria-label="Product filters">
          <div className="shop-filters-head">
            <h3>Filters</h3>
            {hasFilters && (
              <button type="button" className="shop-filters-clear" onClick={clearFilters}>
                Clear all
              </button>
            )}
          </div>
          <label>
            Category
            <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
              <option value="">All categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>
            Sort by
            <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
              <option value="">Newest first</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Name A–Z</option>
            </select>
          </label>
          <div className="shop-filter-note">
            <p>Need bulk orders for your site crew?</p>
            <a href="/contact" className="btn btn-outline btn-sm btn-block">Contact sales</a>
          </div>
        </aside>

        <div className="shop-content">
          <div className="shop-trust-strip">
            <span>🚚 Free shipping over ₹5,000</span>
            <span>🛡️ Impact-resistant lenses</span>
            <span>⚡ Same-day dispatch on select SKUs</span>
          </div>

          {showFeatured && (
            <section className="shop-featured" aria-labelledby="featured-heading">
              <div className="shop-featured-head">
                <div>
                  <h2 id="featured-heading">Top picks for mining crews</h2>
                  <p className="muted">Premium frames with the highest operator ratings</p>
                </div>
              </div>
              <div className="shop-featured-grid">
                {featured.map((p) => (
                  <ProductCard key={p._id} product={p} onAdd={addItem} variant="shop" />
                ))}
              </div>
            </section>
          )}

          <div className="shop-toolbar">
            <div className="shop-toolbar-row">
              <div className="shop-search-wrap">
                <span className="shop-search-icon" aria-hidden>⌕</span>
                <input
                  type="search"
                  className="search-input"
                  placeholder="Search glasses, goggles, welding…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  aria-label="Search products"
                />
              </div>
              {pagination && (
                <p className="shop-result-count">
                  {pagination.total} <span className="muted">products</span>
                </p>
              )}
            </div>

            <div className="shop-sort-pills" role="group" aria-label="Quick sort">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value || 'new'}
                  type="button"
                  className={`shop-pill shop-pill--sort${sort === opt.value ? ' active' : ''}`}
                  onClick={() => { setSort(opt.value); setPage(1); }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {categories.length > 0 && (
              <div className="shop-category-pills" role="group" aria-label="Quick categories">
                <button
                  type="button"
                  className={`shop-pill${!category ? ' active' : ''}`}
                  onClick={() => { setCategory(''); setPage(1); }}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`shop-pill${category === c ? ' active' : ''}`}
                    onClick={() => { setCategory(c); setPage(1); }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            {activeFilters.length > 0 && (
              <div className="shop-active-filters" aria-label="Active filters">
                {activeFilters.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    className="shop-filter-chip"
                    onClick={() => { chip.clear(); setPage(1); }}
                  >
                    {chip.label} <span aria-hidden>×</span>
                  </button>
                ))}
                <button type="button" className="shop-filter-chip shop-filter-chip--clear" onClick={clearFilters}>
                  Clear all
                </button>
              </div>
            )}
          </div>

          {loading && <ProductSkeleton className="shop-skeleton" count={12} />}
          {error && <p className="error-text">{error}</p>}

          {!loading && products.length === 0 && (
            <div className="empty-state shop-empty">
              <p className="shop-empty-icon" aria-hidden>👓</p>
              <h3>No products found</h3>
              <p className="muted">Try adjusting filters or search terms.</p>
              {hasFilters ? (
                <button type="button" className="btn btn-primary" onClick={clearFilters}>
                  Clear filters
                </button>
              ) : (
                <p className="muted">Run <code>npm run seed-products:force</code> to load the catalog.</p>
              )}
            </div>
          )}

          {!loading && products.length > 0 && (
            <>
              <h2 className="shop-grid-heading">
                {category || debouncedSearch ? 'Results' : 'All eyewear'}
              </h2>
              <div className="product-grid">
                {products.map((p) => (
                  <ScrollReveal key={p._id}>
                    <ProductCard product={p} onAdd={addItem} variant="shop" />
                  </ScrollReveal>
                ))}
              </div>
            </>
          )}

          {pagination && pagination.pages > 1 && (
            <nav className="pagination" aria-label="Product pages">
              <button type="button" className="btn btn-outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </button>
              <span>Page {pagination.page} of {pagination.pages}</span>
              <button type="button" className="btn btn-outline" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </nav>
          )}
        </div>
      </div>
    </Layout>
  );
}
