import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Spinner } from '../components/UI';
import type { Group } from '../types';

const COLORS = ['#5FA83C','#7CB342','#7C3AED','#F59E0B','#DC2626','#0891B2','#DB2777','#059669','#EA580C','#6366F1'];

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await api<{ data: Group[] }>('/groups');
      setGroups(res.data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Spinner />;

  return (
    <>
      <div className="page-head">
        <div><h1>Groups</h1><div className="sub">Manage class groups & enrollments — {groups.length} groups</div></div>
      </div>
      <div className="grid-3">
        {groups.map((g, i) => (
          <div key={g.id} className="card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div className="av av-md" style={{ background: COLORS[i % COLORS.length], borderRadius: 10 }}>
                {g.name.split('-')[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{g.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'ui-monospace' }}>{g.academicYear}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '12px 0', borderTop: '1px solid var(--border)', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700 }}>Students</div>
                <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--head-font)' }}>{g._count?.students || 0}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700 }}>Sessions</div>
                <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--head-font)' }}>{g._count?.plannings || 0}</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Branch: {g.branch?.name || '—'}</div>
          </div>
        ))}
      </div>
    </>
  );
}
