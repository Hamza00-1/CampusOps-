import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user, logout } = useAuth();
  if (!user) return null;
  const initials = user.name.split(' ').map(p => p[0]).slice(0, 2).join('');

  return (
    <>
      <div className="page-head"><div><h1>Settings</h1><div className="sub">Manage your account preferences</div></div></div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>Profile</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <div className="av av-md" style={{ background: 'var(--blue)', width: 64, height: 64, fontSize: 20 }}>{initials}</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{user.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{user.email}</div>
            <div style={{ fontSize: 11, marginTop: 4 }}><span className="badge blue">{user.role}</span></div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="field"><label>Full name</label><input defaultValue={user.name} /></div>
          <div className="field"><label>Email</label><input defaultValue={user.email} /></div>
          <div className="field"><label>Role</label><input defaultValue={user.role} disabled style={{ opacity: 0.6 }} /></div>
          <div className="field"><label>Branch</label><input defaultValue={user.branch?.name || 'EIDIA'} disabled style={{ opacity: 0.6 }} /></div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Security</div>
        <div className="setting-row">
          <div><div className="t">Password</div><div className="s">Change your current password.</div></div>
          <button className="btn btn-ghost btn-sm">Change</button>
        </div>
        <div className="setting-row">
          <div><div className="t">Active sessions</div><div className="s">You are currently signed in.</div></div>
          <button className="btn btn-ghost btn-sm">Review</button>
        </div>
      </div>

      <div className="card">
        <button className="btn btn-danger-soft btn-sm" onClick={logout}>⎋ Sign out of this session</button>
      </div>
    </>
  );
}
