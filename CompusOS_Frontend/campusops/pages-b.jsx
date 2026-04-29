/* global React */
const DB = window.CO_DATA;
const { useState: uS } = React;
const cn2 = (...a) => a.filter(Boolean).join(' ');

// ──────────────────────────── PAYMENTS ────────────────────────────
function PaymentsPage({ role }) {
  const [filter, setFilter] = uS('all');
  const payments = DB.payments.filter(p => filter==='all' || p.status===filter);
  const totals = {
    paid: DB.payments.filter(p=>p.status==='paid').reduce((a,p)=>a+p.amount,0),
    pending: DB.payments.filter(p=>p.status==='pending').reduce((a,p)=>a+p.amount,0),
    overdue: DB.payments.filter(p=>p.status==='overdue').reduce((a,p)=>a+p.amount,0),
  };
  return (
    <>
      <div className="page-head">
        <div><h1>Payments</h1><div className="sub">Tuition installments & status.</div></div>
        <div className="page-head-actions">
          <button className="btn btn-ghost btn-sm" style={{width:'auto'}}>Send reminders</button>
          {(role==='admin'||role==='scolarite') && <button className="btn btn-primary btn-sm" style={{width:'auto'}}>+ Record Payment</button>}
        </div>
      </div>

      <div className="grid-3" style={{marginBottom:14}}>
        <div className="stat" style={{'--accent-color':'#10b981'}}>
          <div className="h"><div className="ic" style={{background:'rgba(16,185,129,0.15)',color:'#10b981'}}>✓</div>
            <span className="trend up">▲ 92% collected</span></div>
          <div className="v">{totals.paid.toLocaleString()} <span style={{fontSize:14,color:'var(--text-2)'}}>MAD</span></div>
          <div className="l">Collected this month</div>
        </div>
        <div className="stat" style={{'--accent-color':'#f59e0b'}}>
          <div className="h"><div className="ic" style={{background:'rgba(245,158,11,0.15)',color:'#f59e0b'}}>⏱</div>
            <span className="trend flat">• 3 students</span></div>
          <div className="v">{totals.pending.toLocaleString()} <span style={{fontSize:14,color:'var(--text-2)'}}>MAD</span></div>
          <div className="l">Pending</div>
        </div>
        <div className="stat" style={{'--accent-color':'#ef4444'}}>
          <div className="h"><div className="ic" style={{background:'rgba(239,68,68,0.15)',color:'#ef4444'}}>⚠</div>
            <span className="trend down">▼ 2 overdue</span></div>
          <div className="v">{totals.overdue.toLocaleString()} <span style={{fontSize:14,color:'var(--text-2)'}}>MAD</span></div>
          <div className="l">Overdue</div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div style={{display:'flex',gap:6}}>
            {['all','paid','pending','overdue'].map(f=>(
              <button key={f} className={cn2('btn btn-sm', filter===f?'btn-primary':'btn-ghost')}
                      onClick={()=>setFilter(f)} style={{width:'auto',textTransform:'capitalize'}}>{f}</button>
            ))}
          </div>
          <span className="meta">{payments.length} records</span>
        </div>
        <table className="tbl">
          <thead><tr>
            <th>Student</th><th>Amount</th><th>Due date</th><th>Status</th><th>Method</th><th></th>
          </tr></thead>
          <tbody>
            {payments.map(p=>(
              <tr key={p.id}>
                <td style={{fontWeight:600}}>{p.student}</td>
                <td className="mono">{p.amount.toLocaleString()} MAD</td>
                <td className="mono" style={{color:'var(--text-2)'}}>{p.dueDate}</td>
                <td><span className={cn2('pill', p.status)}><span className="d"/>{p.status}</span></td>
                <td style={{color:'var(--text-2)'}}>{p.method}</td>
                <td><button className="btn btn-ghost btn-sm" style={{width:'auto'}}>Details</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ──────────────────────────── STUDENTS ────────────────────────────
function StudentsPage({ role }) {
  const [q, setQ] = uS('');
  const rows = DB.students.filter(s =>
    s.name.toLowerCase().includes(q.toLowerCase()) ||
    s.email.toLowerCase().includes(q.toLowerCase()) ||
    s.group.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <>
      <div className="page-head">
        <div><h1>Students</h1><div className="sub">{DB.students.length} enrolled students across all branches.</div></div>
        <div className="page-head-actions">
          <button className="btn btn-ghost btn-sm" style={{width:'auto'}}>Import CSV</button>
          {role==='admin' && <button className="btn btn-primary btn-sm" style={{width:'auto'}}>+ Add Student</button>}
        </div>
      </div>
      <div className="card">
        <div className="card-head">
          <input placeholder="Search by name, email, or group…" value={q} onChange={e=>setQ(e.target.value)}
                 style={{flex:1,maxWidth:400,padding:'8px 12px',borderRadius:8,background:'var(--bg-card-2)',
                         border:'1px solid var(--border-2)',color:'var(--text)',fontSize:13}}/>
          <span className="meta">{rows.length} of {DB.students.length}</span>
        </div>
        <table className="tbl">
          <thead><tr>
            <th>Student</th><th>Group</th><th>Attendance</th><th>Progress</th><th>Payment</th><th></th>
          </tr></thead>
          <tbody>
            {rows.map((s,i)=>(
              <tr key={s.id}>
                <td>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div className="avatar-xs" style={{background:`linear-gradient(135deg,hsl(${i*37},60%,55%),#06b6d4)`,color:'white'}}>
                      {s.name.split(' ').map(x=>x[0]).slice(0,2).join('')}
                    </div>
                    <div>
                      <div style={{fontWeight:600}}>{s.name}</div>
                      <div style={{fontSize:11,color:'var(--text-3)'}}>{s.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className="chip blue">{s.group}</span></td>
                <td>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div className="pbar" style={{width:70}}><span style={{width:s.attendance+'%',background:s.attendance>=90?'#10b981':s.attendance>=75?'#f59e0b':'#ef4444'}}/></div>
                    <span className="mono" style={{fontSize:11}}>{s.attendance}%</span>
                  </div>
                </td>
                <td>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div className="pbar" style={{width:70}}><span style={{width:s.progress+'%'}}/></div>
                    <span className="mono" style={{fontSize:11}}>{s.progress}%</span>
                  </div>
                </td>
                <td><span className={cn2('pill', s.paymentStatus)}><span className="d"/>{s.paymentStatus}</span></td>
                <td><button className="btn btn-ghost btn-sm" style={{width:'auto'}}>View →</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ──────────────────────────── NOTIFICATIONS ────────────────────────────
function NotificationsPage({ role }) {
  const [items, setItems] = uS(DB.notifications);
  return (
    <>
      <div className="page-head">
        <div><h1>Notifications</h1><div className="sub">{items.filter(i=>i.unread).length} unread</div></div>
        <div className="page-head-actions">
          <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={()=>setItems(items.map(i=>({...i,unread:false})))}>Mark all read</button>
        </div>
      </div>
      <div className="grid-2-3">
        <div className="card">
          <div className="card-head"><h3>All notifications</h3><span className="meta">Live feed</span></div>
          {items.map(n=>(
            <div key={n.id} className={cn2('notif-item', n.unread && 'unread')}
                 onClick={()=>setItems(items.map(x=>x.id===n.id?{...x,unread:false}:x))}>
              <div className="icn" style={{background:'rgba(26,86,219,0.12)',fontSize:16}}>{n.icon}</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div className="title">{n.title}</div>
                  <span className={cn2('chip',
                    n.type==='absence'?'red':n.type==='payment'?'yellow':n.type==='schedule'?'blue':
                    n.type==='progress'?'green':n.type==='telegram'?'cyan':'gray'
                  )}>{n.type}</span>
                </div>
                <div className="desc">{n.desc}</div>
                <div className="time">{n.time}</div>
              </div>
              {n.unread && <div style={{width:8,height:8,borderRadius:'50%',background:'#3b82f6',marginTop:6,flexShrink:0}}/>}
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-head"><h3>Channels</h3></div>
          {[
            {n:'Email',      v:'SMTP · IMAP',          d:'24 sent today',   e:true, c:'#3b82f6', i:'📧'},
            {n:'Telegram',   v:'Bot @CampusOpsBot',    d:'42 linked users', e:true, c:'#06b6d4', i:'💬'},
            {n:'WhatsApp',   v:'Cloud API',            d:'Optional',        e:false, c:'#10b981', i:'📱'},
            {n:'OpenClaw',   v:'Workflow automation',  d:'3 cron jobs live',e:true, c:'#8b5cf6', i:'⚡'},
          ].map((ch,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 0',borderBottom:i<3?'1px solid var(--border)':'none'}}>
              <div style={{width:36,height:36,borderRadius:9,background:ch.c+'22',color:ch.c,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>{ch.i}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600}}>{ch.n}</div>
                <div style={{fontSize:11,color:'var(--text-3)'}}>{ch.v} · {ch.d}</div>
              </div>
              <div className={cn2('toggle', ch.e && 'on')}/>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ──────────────────────────── SETTINGS ────────────────────────────
function SettingsPage({ role }) {
  const current = DB.roles.find(r=>r.key===role);
  const [toggles, setToggles] = uS({ emails: true, telegram: true, twofa: false, digest: true, sound: false });
  return (
    <>
      <div className="page-head">
        <div><h1>Settings</h1><div className="sub">Manage your profile and notification preferences.</div></div>
      </div>
      <div className="grid-2-3">
        <div>
          <div className="card" style={{marginBottom:14}}>
            <div className="card-head"><h3>Profile</h3></div>
            <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:18}}>
              <div style={{width:64,height:64,borderRadius:'50%',background:`linear-gradient(135deg,${current.color},#06b6d4)`,
                           display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:22}}>
                {current.initials}
              </div>
              <div>
                <div style={{fontSize:16,fontWeight:700}}>{current.name}</div>
                <div style={{fontSize:12,color:'var(--text-2)'}}>{current.email}</div>
                <span className="chip blue" style={{marginTop:6}}>{role}</span>
              </div>
              <button className="btn btn-ghost btn-sm" style={{width:'auto',marginLeft:'auto'}}>Change photo</button>
            </div>
            <div className="grid-2">
              <div className="field"><label>Full name</label><input defaultValue={current.name}/></div>
              <div className="field"><label>Email</label><input defaultValue={current.email}/></div>
              <div className="field"><label>Phone</label><input defaultValue="+212 6 12 34 56 78"/></div>
              <div className="field"><label>Language</label>
                <select><option>Français</option><option>English</option><option>العربية</option></select>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-head"><h3>Security</h3></div>
            {[
              {t:'Two-factor authentication', s:'Add an extra layer of security via OTP.', k:'twofa'},
              {t:'Login alerts', s:'Get notified of new sign-ins to your account.', k:'sound'},
            ].map(s=>(
              <div key={s.k} className="setting-row">
                <div><div className="t">{s.t}</div><div className="s">{s.s}</div></div>
                <div className={cn2('toggle', toggles[s.k] && 'on')} onClick={()=>setToggles({...toggles,[s.k]:!toggles[s.k]})}/>
              </div>
            ))}
            <div className="setting-row">
              <div><div className="t">Session timeout</div><div className="s">JWT access token expires after 15 minutes · refresh 7 days.</div></div>
              <button className="btn btn-ghost btn-sm" style={{width:'auto'}}>Change</button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3>Notifications</h3></div>
          {[
            {t:'Email alerts', s:'Absence, payment, and schedule changes.', k:'emails'},
            {t:'Telegram bot', s:'Link account and receive real-time updates.', k:'telegram'},
            {t:'Weekly digest', s:'Summary email every Monday at 8am.', k:'digest'},
          ].map(s=>(
            <div key={s.k} className="setting-row">
              <div><div className="t">{s.t}</div><div className="s">{s.s}</div></div>
              <div className={cn2('toggle', toggles[s.k] && 'on')} onClick={()=>setToggles({...toggles,[s.k]:!toggles[s.k]})}/>
            </div>
          ))}
          <div style={{padding:'14px 0',borderTop:'1px solid var(--border)',marginTop:4}}>
            <div style={{fontSize:11,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:1.5,marginBottom:8,fontWeight:700}}>Connected</div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              <div style={{display:'flex',alignItems:'center',gap:8,fontSize:12}}>
                <span style={{color:'#10b981'}}>●</span> Telegram · @{current.name.toLowerCase().replace(/\s/g,'')}
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8,fontSize:12}}>
                <span style={{color:'#10b981'}}>●</span> Email · {current.email}
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8,fontSize:12}}>
                <span style={{color:'var(--text-3)'}}>○</span> WhatsApp · Not connected
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

window.PaymentsPage = PaymentsPage;
window.StudentsPage = StudentsPage;
window.NotificationsPage = NotificationsPage;
window.SettingsPage = SettingsPage;
