import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { StatCard, Spinner } from '../components/UI';
import type { Absence } from '../types';

export default function Absences() {
  const [records, setRecords] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await api<{ data: Absence[] }>('/absences');
      setRecords(res.data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Spinner />;

  const present = records.filter(r => r.status === 'Present').length;
  const absent = records.filter(r => r.status === 'Absent').length;
  const late = records.filter(r => r.status === 'Late').length;
  const rate = records.length > 0 ? Math.round((present / records.length) * 100) : 0;

  return (
    <>
      <div className="page-head">
        <div><h1>Attendance</h1><div className="sub">{records.length} records across all sessions</div></div>
      </div>

      <div className="grid-4" style={{ marginBottom: 14 }}>
        <StatCard label="Attendance rate" value={`${rate}%`} icon="✓" color="green" delta={`${present} present`} trend="up" />
        <StatCard label="Absent" value={absent} icon="✗" color="red" delta={`${records.length} total`} trend="down" />
        <StatCard label="Late" value={late} icon="⏰" color="orange" trend="flat" />
        <StatCard label="Total records" value={records.length} icon="≡" color="blue" trend="flat" />
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="tbl">
          <thead><tr><th>Student</th><th>Module</th><th>Session</th><th>Room</th><th>Status</th></tr></thead>
          <tbody>
            {records.slice(0, 50).map(r => {
              const cls = r.status === 'Absent' ? 'absent-row' : '';
              return (
                <tr key={r.id} className={cls}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="av av-xs" style={{ background: r.status === 'Present' ? 'var(--green)' : r.status === 'Absent' ? 'var(--red)' : 'var(--orange)' }}>
                        {r.student?.name?.split(' ').map(p => p[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{r.student?.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{r.student?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{r.session?.module?.name || '—'}</td>
                  <td style={{ fontSize: 12, fontFamily: 'ui-monospace' }}>
                    {r.session ? new Date(r.session.startTime).toLocaleDateString('fr') : '—'}
                  </td>
                  <td style={{ color: 'var(--text-2)' }}>{r.session?.room || '—'}</td>
                  <td>
                    <span className={`pill ${r.status === 'Present' ? 'paid' : r.status === 'Absent' ? 'overdue' : 'pending'}`}>
                      <span className="d" />{r.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
