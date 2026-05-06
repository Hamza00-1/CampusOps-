import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Spinner } from '../components/UI';
import type { Branch } from '../types';

export default function Branches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await api<{ data: Branch[] }>('/branches');
      setBranches(res.data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Spinner />;

  return (
    <>
      <div className="page-head">
        <div><h1>Branches</h1><div className="sub">Academic departments & programs</div></div>
      </div>
      <div className="grid-2">
        {branches.map(b => (
          <div key={b.id} className="card" style={{ padding: 20, borderLeft: '3px solid var(--blue)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--blue-50)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, fontFamily: 'var(--head-font)' }}>E</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--head-font)' }}>{b.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 3 }}>{b.location}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, padding: '14px 0', borderTop: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700 }}>Users</div>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--head-font)', color: 'var(--blue)' }}>{b._count?.users || 0}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700 }}>Modules</div>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--head-font)' }}>{b._count?.modules || 0}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700 }}>Groups</div>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--head-font)' }}>{b._count?.groups || 0}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
