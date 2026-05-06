import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Spinner } from '../components/UI';
import type { Payment } from '../types';

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      const res = await api<{ data: Payment[] }>('/payments');
      setPayments(res.data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Spinner />;

  const filtered = payments.filter(p => {
    const matchSt = status === 'all' || p.status.toLowerCase() === status;
    const matchSr = !search || p.student?.name?.toLowerCase().includes(search.toLowerCase());
    return matchSt && matchSr;
  });

  const sum = (arr: Payment[]) => arr.reduce((a, p) => a + parseFloat(p.amount), 0);
  const paid = payments.filter(p => p.status === 'Paid');
  const unpaid = payments.filter(p => p.status === 'Unpaid');

  return (
    <>
      <div className="page-head">
        <div><h1>Payments</h1><div className="sub">{payments.length} invoices</div></div>
      </div>

      <div className="grid-4" style={{ marginBottom: 14 }}>
        <div className="stat" style={{ borderLeft: '3px solid var(--green)' }}>
          <div className="stat-h"><div className="stat-ic" style={{ background: 'var(--green-50)', color: 'var(--green-600)' }}>✓</div><span className="pill paid"><span className="d" />Paid</span></div>
          <div className="stat-v">{sum(paid).toLocaleString()} <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>MAD</span></div>
          <div className="stat-l">{paid.length} invoices collected</div>
        </div>
        <div className="stat" style={{ borderLeft: '3px solid var(--red)' }}>
          <div className="stat-h"><div className="stat-ic" style={{ background: 'var(--red-50)', color: 'var(--red)' }}>⚠</div><span className="pill overdue"><span className="d" />Unpaid</span></div>
          <div className="stat-v">{sum(unpaid).toLocaleString()} <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>MAD</span></div>
          <div className="stat-l">{unpaid.length} awaiting payment</div>
        </div>
        <div className="stat" style={{ borderLeft: '3px solid var(--blue)' }}>
          <div className="stat-v">{payments.length}</div><div className="stat-l">Total invoices</div>
        </div>
        <div className="stat" style={{ borderLeft: '3px solid var(--orange)' }}>
          <div className="stat-v">{sum(payments).toLocaleString()}</div><div className="stat-l">Total amount (MAD)</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="segment">
            {['all', 'paid', 'unpaid', 'partial'].map(s => (
              <button key={s} className={status === s ? 'active' : ''} onClick={() => setStatus(s)}>{s[0].toUpperCase() + s.slice(1)}</button>
            ))}
          </div>
          <div style={{ flex: 1, maxWidth: 280, position: 'relative' }}>
            <input placeholder="Search student…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 34px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }} />
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}>⌕</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{filtered.length} invoices</div>
        </div>
        <table className="tbl">
          <thead><tr><th>Student</th><th>Type</th><th style={{ textAlign: 'right' }}>Amount</th><th>Due Date</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.slice(0, 50).map(p => (
              <tr key={p.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="av av-xs" style={{ background: p.status === 'Paid' ? 'var(--green)' : 'var(--red)' }}>
                      {p.student?.name?.split(' ').map(x => x[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.student?.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{p.student?.email}</div>
                    </div>
                  </div>
                </td>
                <td>{p.planType}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'ui-monospace' }}>{parseFloat(p.amount).toLocaleString()}</td>
                <td style={{ color: 'var(--text-2)', fontSize: 12 }}>{new Date(p.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td><span className={`pill ${p.status === 'Paid' ? 'paid' : p.status === 'Unpaid' ? 'overdue' : 'partial'}`}><span className="d" />{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
