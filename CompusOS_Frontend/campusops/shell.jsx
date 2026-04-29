/* global React */
const { useState, useEffect, useMemo } = React;
const D = window.CO_DATA;

// ──────────────────────────── SIDEBAR ────────────────────────────
function Sidebar({ page, setPage, role, unread }) {
  const items = [
    { key: 'dashboard',     icon: '▦', label: 'Dashboard' },
    { key: 'planning',      icon: '▤', label: 'Planning' },
    { key: 'attendance',    icon: '✓', label: 'Attendance' },
    { key: 'progress',      icon: '◐', label: 'Progress' },
    { key: 'payments',      icon: '◇', label: 'Payments' },
    { key: 'students',      icon: '◉', label: 'Students' },
    { key: 'notifications', icon: '◔', label: 'Notifications', badge: unread },
    { key: 'settings',      icon: '❈', label: 'Settings' },
  ];
  // filter some items per role
  const filtered = items.filter(it => {
    if (role === 'etudiant' && ['students'].includes(it.key)) return false;
    if (role === 'enseignant' && ['students'].includes(it.key)) return false;
    return true;
  });
  return (
    <aside className="sidebar">
      <div className="sb-logo" title="CampusOps">C</div>
      <nav className="sb-nav">
        {filtered.map(it => (
          <div key={it.key}
               className={`sb-item ${page === it.key ? 'active' : ''}`}
               onClick={() => setPage(it.key)}>
            <span style={{fontSize: 20}}>{it.icon}</span>
            {it.badge ? <span className="badge" /> : null}
            <span className="tip">{it.label}</span>
          </div>
        ))}
      </nav>
      <div className="sb-divider" />
      <div className="sb-avatar" title="Profile">
        {D.roles.find(r => r.key === role)?.initials}
      </div>
    </aside>
  );
}

// ──────────────────────────── TOPBAR ────────────────────────────
function Topbar({ page, role, setRole, onLogout, unread }) {
  const current = D.roles.find(r => r.key === role);
  const [roleOpen, setRoleOpen] = useState(false);
  const pageNames = {
    dashboard: 'Dashboard', planning: 'Planning', attendance: 'Attendance',
    progress: 'Progress', payments: 'Payments', students: 'Students',
    notifications: 'Notifications', settings: 'Settings',
  };
  return (
    <div className="topbar">
      <div className="tb-crumbs">
        <span>CampusOps</span>
        <span>›</span>
        <span className="cur">{pageNames[page]}</span>
      </div>
      <div className="tb-search">
        <input placeholder="Search students, modules, groups…" />
      </div>
      <div className="tb-spacer" />
      <div className="tb-actions">
        <div style={{position: 'relative'}}>
          <button className="tb-role-switch" onClick={() => setRoleOpen(!roleOpen)}>
            <span className="rdot" style={{background: current.color}} />
            <span style={{fontWeight: 600}}>{current.name}</span>
            <span style={{color: 'var(--text-3)', fontSize: 10}}>▾</span>
          </button>
          {roleOpen && (
            <div style={{position:'absolute',top:42,right:0,background:'var(--bg-elev)',
                         border:'1px solid var(--border-2)',borderRadius:10,padding:6,
                         minWidth:180,zIndex:150,boxShadow:'var(--shadow-lg)'}}>
              {D.roles.map(r => (
                <div key={r.key}
                     onClick={() => { setRole(r.key); setRoleOpen(false); }}
                     style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',
                             borderRadius:6,cursor:'pointer',fontSize:13,
                             background: r.key===role ? 'rgba(26,86,219,0.15)' : 'transparent'}}>
                  <span style={{width:8,height:8,borderRadius:'50%',background:r.color}}/>
                  <span style={{fontWeight:600}}>{r.name}</span>
                  <span style={{marginLeft:'auto',fontSize:10,color:'var(--text-3)',fontFamily:'monospace'}}>{r.key}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <button className="tb-icon-btn" title="Notifications">
          ◔ {unread > 0 && <span className="dot" />}
        </button>
        <button className="tb-icon-btn" title="Help">?</button>
        <div className="tb-user" onClick={onLogout} title="Logout">
          <div className="av" style={{background: `linear-gradient(135deg, ${current.color}, #06b6d4)`}}>
            {current.initials}
          </div>
          <div>
            <div className="nm">{current.name}</div>
            <div className="rl">{current.email}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.Sidebar = Sidebar;
window.Topbar = Topbar;
