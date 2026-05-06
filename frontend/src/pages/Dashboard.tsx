import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { StatCard, Spinner } from '../components/UI';
import type { ApiResponse, Branch, Group, Payment, Planning } from '../types';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, modules: 0, groups: 0, sessions: 0, payments: 0, overdue: 0 });
  const [todaySessions, setToday] = useState<Planning[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [uRes, mRes, gRes, pRes, payRes, todayRes] = await Promise.all([
          api<{ meta: { total: number } }>('/users?page=1&limit=1'),
          api<{ data: unknown[] }>('/modules'),
          api<{ data: Group[] }>('/groups'),
          api<{ data: Planning[] }>('/planning'),
          api<{ data: Payment[] }>('/payments'),
          api<ApiResponse<Planning[]>>('/planning/today'),
        ]);
        const overdueCount = payRes.data.filter((p: Payment) => p.status === 'Unpaid' && new Date(p.dueDate) < new Date()).length;
        setStats({
          users: uRes.meta?.total || 0, modules: mRes.data.length,
          groups: gRes.data.length, sessions: pRes.data.length,
          payments: payRes.data.length, overdue: overdueCount,
        });
        setToday(todayRes.data || []);
        setGroups(gRes.data);
        const bRes = await api<{ data: Branch[] }>('/branches');
        setBranches(bRes.data);
      } catch { /* handled */ }
      setLoading(false);
    })();
  }, []);

  if (loading) return <Spinner />;
  if (!user) return null;

  const greeting = (() => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; })();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <>
      <div className="page-head">
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4, fontWeight: 500 }}>{today}</div>
          <h1>{greeting}, {user.name.split(' ')[0]}.</h1>
          <div className="sub">Here's what's happening on your {user.role.toLowerCase()} workspace today.</div>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 14 }}>
        <StatCard label="Total users" value={stats.users} icon="◍" color="blue" delta={`${stats.groups} groups`} trend="flat" />
        <StatCard label="Modules" value={stats.modules} icon="≡" color="green" delta="5 fields" trend="up" />
        <StatCard label="Sessions" value={stats.sessions} icon="▦" color="orange" delta={`${todaySessions.length} today`} trend="flat" />
        <StatCard label="Unpaid invoices" value={stats.overdue} icon="⚠" color="red" delta={`/${stats.payments} total`} trend="down" />
      </div>

      <div className="grid-2" style={{ marginBottom: 14 }}>
        <div className="card">
          <div className="card-head"><h3>Today's Sessions</h3><span className="badge blue">{todaySessions.length}</span></div>
          {todaySessions.length === 0 && <div className="empty">No sessions scheduled today</div>}
          {todaySessions.map(s => (
            <div key={s.id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 3, borderRadius: 2, background: 'var(--blue)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'ui-monospace', fontWeight: 600 }}>
                  {new Date(s.startTime).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })} — {new Date(s.endTime).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, margin: '2px 0' }}>{s.module?.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{s.group?.name} · Room {s.room}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-head"><h3>Groups Overview</h3><span className="meta">{groups.length} groups</span></div>
          {groups.slice(0, 8).map((g, i) => (
            <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 7 ? '1px solid var(--border)' : '0' }}>
              <div className="av av-sm" style={{ background: `hsl(${i * 36}, 60%, 45%)` }}>{g.name.slice(0, 2)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{g.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{g._count?.students || 0} students · {g.academicYear}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {branches.length > 0 && (
        <div className="card">
          <div className="card-head"><h3>Branch</h3></div>
          {branches.map(b => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--blue-50)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800 }}>E</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--head-font)' }}>{b.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{b.location}</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-2)' }}>
                {b._count?.users || 0} users · {b._count?.modules || 0} modules · {b._count?.groups || 0} groups
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
