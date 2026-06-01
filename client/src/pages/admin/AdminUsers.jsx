import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import StatusBadge from '../../components/admin/StatusBadge';
import { api, userApi } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    userApi
      .list()
      .then((res) => setUsers(res.data || []))
      .catch((err) => toast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const adminCount = users.filter((u) => u.role === 'admin').length;

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/signup', { name: form.name, email: form.email, password: form.password });
      if (form.role === 'admin') {
        const list = await userApi.list();
        const created = list.data.find((u) => u.email === form.email.toLowerCase());
        if (created) {
          await userApi.update(created._id, { name: created.name, email: created.email, role: 'admin' });
        }
      }
      toast('User created', 'success');
      setForm({ name: '', email: '', password: '', role: 'user' });
      setShowForm(false);
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await userApi.remove(id);
      toast('User deleted', 'success');
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <AdminLayout
      title="Users"
      subtitle={`${users.length} accounts · ${adminCount} administrators`}
      actions={
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ Add user'}
        </button>
      }
    >
      {showForm && (
        <form className="admin-panel admin-form admin-form--inline" onSubmit={handleAdd}>
          <input placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input type="password" placeholder="Password (8+ chars)" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" className="btn btn-primary">Create</button>
        </form>
      )}

      <div className="admin-toolbar">
        <input
          type="search"
          className="admin-search"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-panel admin-panel--flush">
        {loading ? (
          <p className="admin-empty-hint">Loading users…</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table admin-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th></th></tr></thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u._id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td><StatusBadge status={u.role} /></td>
                    <td className="muted">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                    <td>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id)}>
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
