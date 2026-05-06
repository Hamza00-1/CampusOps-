import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Spinner } from '../components/UI';
import type { Notification } from '../types';

export default function Notifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await api<{ data: Notification[] }>('/notifications');
      setItems(res.data || []);
      setLoading(false);
    })();
  }, []);

  const markAllRead = async () => {
    await api('/notifications/read-all', { method: 'PUT' });
    setItems(items.map(n => ({ ...n, isRead: true })));
  };

  if (loading) return <Spinner />;
  const unread = items.filter(n => !n.isRead).length;

  return (
    <>
      <div className="page-head">
        <div><h1>Notifications</h1><div className="sub">{unread} unread · {items.length} total</div></div>
        <div className="page-actions">
          <button className="btn btn-ghost btn-sm" onClick={markAllRead}>Mark all read</button>
        </div>
      </div>
      <div className="card" style={{ padding: 10 }}>
        {items.length === 0 && <div className="empty">No notifications</div>}
        {items.map(n => (
          <div key={n.id} className={`notif ${!n.isRead ? 'unread' : ''}`}>
            <div className="ic" style={{ background: !n.isRead ? 'var(--blue-50)' : '#F1F5F9', color: !n.isRead ? 'var(--blue)' : 'var(--text-3)' }}>
              {!n.isRead ? 'ℹ' : '✓'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span className="t">{n.title}</span>
                {!n.isRead && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--blue)' }} />}
              </div>
              <div className="d">{n.content}</div>
              <div className="tm">{new Date(n.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
