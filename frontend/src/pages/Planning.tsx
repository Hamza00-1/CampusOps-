import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Spinner } from '../components/UI';
import type { Planning } from '../types';

export default function PlanningPage() {
  const [sessions, setSessions] = useState<Planning[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'all' | 'today' | 'week'>('week');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const path = view === 'today' ? '/planning/today' : view === 'week' ? '/planning/week' : '/planning';
      const res = await api<{ data: Planning[] }>(path);
      setSessions(res.data || []);
      setLoading(false);
    })();
  }, [view]);

  if (loading) return <Spinner />;

  const byDay: Record<string, Planning[]> = {};
  sessions.forEach(s => {
    const day = new Date(s.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    (byDay[day] ||= []).push(s);
  });

  return (
    <>
      <div className="page-head">
        <div><h1>Planning</h1><div className="sub">Class schedule — {sessions.length} sessions</div></div>
        <div className="page-actions">
          <div className="segment">
            {(['today', 'week', 'all'] as const).map(v => (
              <button key={v} className={view === v ? 'active' : ''} onClick={() => setView(v)}>{v[0].toUpperCase() + v.slice(1)}</button>
            ))}
          </div>
        </div>
      </div>

      {sessions.length === 0 && <div className="empty">No sessions found for this period</div>}

      {Object.entries(byDay).map(([day, items]) => (
        <div key={day} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{day}</div>
          <div className="card" style={{ padding: 0 }}>
            {items.map((s, i) => (
              <div key={s.id} style={{ display: 'flex', gap: 12, padding: '14px 18px', borderBottom: i < items.length - 1 ? '1px solid var(--border)' : '0' }}>
                <div style={{ width: 3, borderRadius: 2, background: `hsl(${(s.module?.name || '').length * 25}, 60%, 50%)`, flexShrink: 0 }} />
                <div style={{ width: 90, fontSize: 11, fontFamily: 'ui-monospace', fontWeight: 600, color: 'var(--text-3)', paddingTop: 2 }}>
                  {new Date(s.startTime).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}
                  <br />{new Date(s.endTime).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{s.module?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
                    {s.group?.name} · {s.teacher?.name} · Room {s.room}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'right' }}>
                  {s._count?.absences || 0} marked
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
