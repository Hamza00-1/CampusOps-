import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Spinner } from '../components/UI';
import type { Module } from '../types';

const COLORS = ['#5FA83C','#7CB342','#7C3AED','#F59E0B','#DC2626','#0891B2','#DB2777','#059669','#EA580C','#6366F1'];

export default function Modules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [semFilter, setSem] = useState('all');

  useEffect(() => {
    (async () => {
      const res = await api<{ data: Module[] }>('/modules');
      setModules(res.data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Spinner />;

  const semesters = [...new Set(modules.map(m => {
    const match = m.description?.match(/Semester: (S\d+)/);
    return match ? match[1] : 'Other';
  }))].sort();

  const filtered = modules.filter(m => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase());
    const sem = m.description?.match(/Semester: (S\d+)/)?.[1] || 'Other';
    const matchSem = semFilter === 'all' || sem === semFilter;
    return matchSearch && matchSem;
  });

  return (
    <>
      <div className="page-head">
        <div><h1>Modules</h1><div className="sub">{modules.length} modules across 5 fields</div></div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, maxWidth: 320, position: 'relative' }}>
          <input placeholder="Search modules…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 34px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }} />
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}>⌕</span>
        </div>
        <div className="segment">
          <button className={semFilter === 'all' ? 'active' : ''} onClick={() => setSem('all')}>All</button>
          {semesters.map(s => (
            <button key={s} className={semFilter === s ? 'active' : ''} onClick={() => setSem(s)}>{s}</button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{filtered.length} results</div>
      </div>

      <div className="grid-3">
        {filtered.slice(0, 30).map((m, i) => {
          const field = m.description?.match(/Field: (.+?) \|/)?.[1] || '';
          const sem = m.description?.match(/Semester: (S\d+)/)?.[1] || '';
          const color = COLORS[i % COLORS.length];
          return (
            <div key={m.id} className="card" style={{ borderTop: `3px solid ${color}`, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 11, fontFamily: 'ui-monospace', fontWeight: 700, color, letterSpacing: 0.4 }}>{sem}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginTop: 3, fontFamily: 'var(--head-font)' }}>{m.name}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 8 }}>{field}</div>
              <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--text-3)' }}>
                <span>{m._count?.plannings || 0} sessions</span>
                <span>{m._count?.progress || 0} progress</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
