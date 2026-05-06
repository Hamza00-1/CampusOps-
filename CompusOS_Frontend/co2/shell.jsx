// CampusOps — Shell (sidebar + topbar)
const { useState: useS1, useEffect: useE1, useRef: useR1 } = React;

function Sidebar({ role, active, onNav, collapsed, onToggle }) {
  const user = ROLES[role];
  const unread = NOTIFICATIONS.filter(n=>!n.read).length;
  return (
    <aside className="sb">
      <div className="sb-head">
        <div className="sb-logo">C</div>
        {!collapsed && <div className="sb-brand">CampusOps<small>Academic Platform</small></div>}
        <button className="sb-toggle" onClick={onToggle} title={collapsed?'Expand':'Collapse'}>
          {collapsed?'›':'‹'}
        </button>
      </div>
      <div className="sb-body">
        {NAV_GROUPS.map(g => {
          const items = g.items.filter(i => i.roles.includes(role));
          if(!items.length) return null;
          return (
            <div className="sb-group" key={g.label}>
              <div className="sb-group-label">{g.label}</div>
              {items.map(i => (
                <div key={i.id} className={`sb-item ${active===i.id?'active':''}`} onClick={()=>onNav(i.id)}>
                  <span className="ic">{i.icon}</span>
                  <span className="lbl">{i.label}</span>
                  {i.id==='notifications' && unread>0 && <span className="cnt">{unread}</span>}
                  <span className="tip">{i.label}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <div className="sb-foot">
        <div className="sb-user" title={user.name}>
          <div className="av" style={{background:user.color}}>{user.name.split(' ').map(p=>p[0]).slice(0,2).join('')}</div>
          <div className="info">
            <div className="nm">{user.name}</div>
            <div className="rl">{user.label}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ role, onRole, onLogout, onNav, unread, notifOpen, setNotifOpen, profOpen, setProfOpen, pageTitle }) {
  const user = ROLES[role];
  const nRef = useR1(null), pRef = useR1(null);
  useE1(()=>{
    const h = e => {
      if(nRef.current && !nRef.current.contains(e.target)) setNotifOpen(false);
      if(pRef.current && !pRef.current.contains(e.target)) setProfOpen(false);
    };
    document.addEventListener('mousedown', h);
    return ()=>document.removeEventListener('mousedown', h);
  },[]);

  return (
    <header className="tb">
      <div className="tb-search">
        <input placeholder={`Search ${pageTitle.toLowerCase()}, students, invoices…`} />
        <span className="tb-kbd">⌘K</span>
      </div>
      <div className="tb-sp" />

      <div ref={nRef} style={{position:'relative'}}>
        <button className="tb-btn" onClick={()=>{setNotifOpen(!notifOpen);setProfOpen(false);}} title="Notifications">
          ◐ {unread>0 && <span className="nbadge" />}
        </button>
        {notifOpen && (
          <div className="menu" style={{minWidth:340,padding:0}}>
            <div style={{padding:'12px 14px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <strong style={{fontSize:13}}>Notifications</strong>
              <span className="badge blue">{unread} new</span>
            </div>
            <div style={{maxHeight:360,overflowY:'auto',padding:6}}>
              {NOTIFICATIONS.slice(0,5).map(n => {
                const t = n.type;
                const c = t==='alert'?'red':t==='success'?'green':t==='reminder'?'orange':'blue';
                const ic = t==='alert'?'⚠':t==='success'?'✓':t==='reminder'?'⏰':'ℹ';
                return (
                  <div key={n.id} className={`notif ${!n.read?'unread':''}`} style={{padding:'10px 10px'}}>
                    <div className="ic" style={{background:`var(--${c==='red'?'red':c==='green'?'green':c==='orange'?'orange':'blue'}-50)`,color:`var(--${c==='red'?'red':c==='green'?'green-600':c==='orange'?'orange':'blue'})`}}>{ic}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div className="t" style={{fontSize:12.5}}>{n.title}</div>
                      <div className="d" style={{fontSize:11.5}}>{n.desc}</div>
                      <div className="tm">{n.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{padding:10,borderTop:'1px solid var(--border)',textAlign:'center'}}>
              <button className="link" onClick={()=>{onNav('notifications');setNotifOpen(false);}}>View all notifications →</button>
            </div>
          </div>
        )}
      </div>

      <button className="tb-btn" title="Help" onClick={()=>alert('CampusOps v1.0\nAcademic Platform\n\nKeyboard shortcuts:\n• Ctrl+K — Search\n• Esc — Close drawer\n\nSupport: support@campusops.ma')}>?</button>

      <div ref={pRef} style={{position:'relative'}}>
        <div className="tb-role" onClick={()=>{setProfOpen(!profOpen);setNotifOpen(false);}}>
          <span className="d" style={{background:user.color}}/>
          <span>{user.label}</span>
          <span style={{opacity:.5}}>▾</span>
        </div>
        {profOpen && (
          <div className="menu">
            <div style={{padding:'10px 10px',borderBottom:'1px solid var(--border)',marginBottom:6,display:'flex',gap:10,alignItems:'center'}}>
              <div className="av av-sm" style={{background:user.color}}>{user.name.split(' ').map(p=>p[0]).slice(0,2).join('')}</div>
              <div style={{minWidth:0,flex:1}}>
                <div style={{fontSize:13,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user.name}</div>
                <div style={{fontSize:11,color:'var(--text-3)'}}>{user.email}</div>
              </div>
            </div>
            <div style={{padding:'4px 10px 2px',fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:1}}>Switch role (demo)</div>
            {Object.values(ROLES).map(r => (
              <div key={r.id} className={`menu-item ${role===r.id?'active':''}`} onClick={()=>{onRole(r.id);setProfOpen(false);}}>
                <span className="d" style={{width:8,height:8,borderRadius:'50%',background:r.color,display:'inline-block'}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:12.5,fontWeight:600}}>{r.label}</div>
                  <div style={{fontSize:10.5,color:'var(--text-3)'}}>{r.name}</div>
                </div>
                {role===r.id && <span style={{color:'var(--blue)'}}>✓</span>}
              </div>
            ))}
            <div style={{height:1,background:'var(--border)',margin:'6px 0'}} />
            <div className="menu-item" onClick={()=>{onNav('settings');setProfOpen(false);}}>⚙ Settings</div>
            <div className="menu-item" onClick={onLogout} style={{color:'var(--red)'}}>⎋ Sign out</div>
          </div>
        )}
      </div>
    </header>
  );
}

function Toasts({ items, remove }) {
  return (
    <div className="toasts">
      {items.map(t => {
        const ic = t.type==='success'?'✓':t.type==='error'?'⚠':t.type==='warn'?'⚠':'ℹ';
        return (
          <div key={t.id} className={`toast ${t.type||''}`}>
            <div style={{fontSize:16,lineHeight:'18px'}}>{ic}</div>
            <div style={{flex:1,minWidth:0}}>
              <div className="tt">{t.title}</div>
              {t.desc && <div className="td">{t.desc}</div>}
            </div>
            <button className="tb-btn" style={{width:24,height:24,fontSize:12}} onClick={()=>remove(t.id)}>×</button>
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar, Toasts });
