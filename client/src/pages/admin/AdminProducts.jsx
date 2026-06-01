import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { formatINR } from '../../components/admin/StatCard';
import { productApi } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', imageUrl: '', stock: '100' });
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    productApi
      .list({ limit: 100 })
      .then((res) => setProducts(res.data.products || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
    );
  }, [products, search]);

  const lowStockCount = products.filter((p) => (p.stock ?? 0) <= 10).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await productApi.create({
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
      });
      toast('Product added successfully', 'success');
      setForm({ name: '', description: '', price: '', category: '', imageUrl: '', stock: '100' });
      setShowForm(false);
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productApi.remove(id);
      toast('Product deleted', 'success');
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <AdminLayout
      title="Products"
      subtitle={`${products.length} SKUs · ${lowStockCount} low stock`}
      actions={
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ Add product'}
        </button>
      }
    >
      {showForm && (
        <form className="admin-panel admin-form" onSubmit={handleSubmit}>
          <h2>New product</h2>
          <div className="form-grid">
            <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Category<input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label>
            <label>Price (₹)<input type="number" required min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
            <label>Stock<input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></label>
          </div>
          <label>Image URL<input required value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://…" /></label>
          <label>Description<textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <button type="submit" className="btn btn-primary">Save product</button>
        </form>
      )}

      <div className="admin-toolbar">
        <input
          type="search"
          className="admin-search"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-panel admin-panel--flush">
        {loading ? (
          <p className="admin-empty-hint">Loading products…</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table admin-table">
              <thead>
                <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id} className={(p.stock ?? 0) <= 10 ? 'row-warn' : ''}>
                    <td>
                      <div className="admin-product-cell">
                        {p.imageUrl && <img src={p.imageUrl} alt="" className="admin-product-thumb" />}
                        <strong>{p.name}</strong>
                      </div>
                    </td>
                    <td>{p.category}</td>
                    <td>{formatINR(p.price)}</td>
                    <td>
                      <span className={`stock-pill${(p.stock ?? 0) <= 5 ? ' stock-pill--warn' : ''}`}>
                        {p.stock ?? '—'}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
