import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { StatCard, Spinner } from '../components/UI';
import type { User } from '../types';

const ROLE_COLORS: Record<string, string> = { Admin: '#5FA83C', Scolarite: '#7C3AED', Enseignant: '#7CB342', Etudiant: '#F59E0B' };

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRole] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (roleFilter !== 'all') params.set('role', roleFilter);
      const res = await api<{ data: User[]; meta: { total: number; pages: number } }>(`/users?${params}`);
      setUsers(res.data || []);
      setTotal(res.meta?.total || 0);
      setLoading(false);
    })();
  }, [page, search, roleFilter]);

  const counts = { Admin: 0, Scolarite: 0, Enseignant: 0, Etudiant: 0 };

  return (
    <>
      <div className="page-head">
        <div><h1>Users</h1><div className="sub">Manage platform accounts — {total} total</div></div>
      </div>

      <div className="grid-4" style={{ marginBottom: 14 }}>
        <StatCard label="Total accounts" value={total} icon="◍" color="blue" trend="flat" />
        <StatCard label="Faculty" value={counts.Enseignant || '—'} icon="◴" color="green" trend="flat" />
        <StatCard label="Students" value={counts.Etudiant || '—'} icon="◎" color="orange" trend="flat" />
        <StatCard label="Admin staff" value={counts.Admin || '—'} icon="⚙" color="blue" trend="flat" />
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, maxWidth: 320, position: 'relative' }}>
            <input placeholder="Search users…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ width: '100%', padding: '8px 12px 8px 34px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }} />
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}>⌕</span>
          </div>
          <div className="segment">
            {['all', 'Admin', 'Scolarite', 'Enseignant', 'Etudiant'].map(r => (
              <button key={r} className={roleFilter === r ? 'active' : ''} onClick={() => { setRole(r); setPage(1); }}>
                {r === 'all' ? 'All' : r}
              </button>
            ))}
          </div>
        </div>

        {loading ? <Spinner /> : (
          <table className="tbl">
            <thead><tr><th>User</th><th>Role</th><th>Email</th><th>Branch</th><th>Joined</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="av av-sm" style={{ background: ROLE_COLORS[u.role] || '#64748B' }}>
                        {u.name.split(' ').map(p => p[0]).join('').slice(0, 2)}
                      </div>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                    </div>
                  </td>
                  <td><span className="badge blue">{u.role}</span></td>
                  <td style={{ color: 'var(--text-2)', fontSize: 12.5 }}>{u.email}</td>
                  <td style={{ color: 'var(--text-2)' }}>{u.branch?.name || '—'}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-3)' }}>{new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {total > 20 && (
          <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span style={{ fontSize: 12, color: 'var(--text-2)', padding: '6px 12px' }}>Page {page}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </>
  );
}
