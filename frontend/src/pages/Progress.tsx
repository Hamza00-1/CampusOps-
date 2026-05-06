import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Spinner, Ring } from '../components/UI';

interface ProgressItem { id: string; moduleId: string; groupId: string; percentage: number; module?: { id: string; name: string }; group?: { id: string; name: string }; }

export default function Progress() {
  const [items, setItems] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await api<{ data: ProgressItem[] }>('/progress');
      setItems(res.data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Spinner />;

  const avg = items.length > 0 ? Math.round(items.reduce((a, p) => a + p.percentage, 0) / items.length) : 0;
  const COLORS = ['#5FA83C','#7CB342','#7C3AED','#F59E0B','#DC2626','#0891B2','#DB2777','#059669'];

  return (
    <>
      <div className="page-head">
        <div><h1>Progress</h1><div className="sub">Course completion tracking — {items.length} records</div></div>
      </div>

      <div className="grid-4" style={{ marginBottom: 14 }}>
        <div className="stat">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Ring value={avg} color="var(--blue)" size={56} />
            <div>
              <div className="stat-v" style={{ margin: 0 }}>{avg}%</div>
              <div className="stat-l">Average progress</div>
            </div>
          </div>
        </div>
        <div className="stat"><div className="stat-v">{items.length}</div><div className="stat-l">Tracked modules</div></div>
        <div className="stat"><div className="stat-v">{items.filter(p => p.percentage >= 80).length}</div><div className="stat-l">Near completion (≥80%)</div></div>
        <div className="stat"><div className="stat-v">{items.filter(p => p.percentage < 30).length}</div><div className="stat-l">Early stage (&lt;30%)</div></div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="tbl">
          <thead><tr><th>Module</th><th>Group</th><th>Progress</th><th style={{ textAlign: 'right' }}>%</th></tr></thead>
          <tbody>
            {items.map((p, i) => (
              <tr key={p.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 4, height: 28, borderRadius: 2, background: COLORS[i % COLORS.length] }} />
                    <div style={{ fontWeight: 600 }}>{p.module?.name || '—'}</div>
                  </div>
                </td>
                <td><span className="badge blue">{p.group?.name || '—'}</span></td>
                <td style={{ width: 200 }}>
                  <div className="pbar"><span style={{ width: `${p.percentage}%`, background: p.percentage >= 80 ? 'var(--green)' : p.percentage >= 50 ? 'var(--blue)' : 'var(--orange)' }} /></div>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--head-font)', color: COLORS[i % COLORS.length] }}>{p.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
