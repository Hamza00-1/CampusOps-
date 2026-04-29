// CampusOps — Modules, Progress, Users, Groups, Branches, Notifications, Settings
const { useState: uS2 } = React;

function Modules({ role, toast }) {
  return (
    <>
      <div className="page-head">
        <div><h1>Modules</h1><div className="sub">Academic modules catalog — {MODULES.length} modules · 29 total credits</div></div>
        <div className="page-actions">
          {role==='admin' && <button className="btn btn-primary btn-sm" onClick={()=>toast({title:'New module'})}>+ New module</button>}
        </div>
      </div>
      <div className="grid-3">
        {MODULES.map(m => {
          const prog = [78,64,45,92,31,58][MODULES.indexOf(m)];
          const students = [54,85,34,106,22,48][MODULES.indexOf(m)];
          return (
            <div key={m.code} className="card" style={{borderTop:`3px solid ${m.color}`,padding:20}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                <div>
                  <div style={{fontSize:11,fontFamily:'ui-monospace',fontWeight:700,color:m.color,letterSpacing:0.4}}>{m.code}</div>
                  <div style={{fontSize:15,fontWeight:700,marginTop:3,fontFamily:'var(--head-font)'}}>{m.name}</div>
                </div>
                <button className="tb-btn" style={{width:28,height:28,fontSize:14}}>⋯</button>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
                <div className="av av-xs" style={{background:m.color}}>{m.teacher.split(' ').slice(-2).map(p=>p[0]).join('')}</div>
                <span style={{fontSize:12,color:'var(--text-2)'}}>{m.teacher}</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,padding:'12px 0',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)',marginBottom:12}}>
                <div><div style={{fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:0.8,fontWeight:700}}>Students</div><div style={{fontSize:16,fontWeight:800,fontFamily:'var(--head-font)'}}>{students}</div></div>
                <div><div style={{fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:0.8,fontWeight:700}}>Credits</div><div style={{fontSize:16,fontWeight:800,fontFamily:'var(--head-font)'}}>{m.credits}</div></div>
              </div>
              <div style={{fontSize:11,color:'var(--text-2)',marginBottom:6,display:'flex',justifyContent:'space-between'}}><span>Syllabus progress</span><strong>{prog}%</strong></div>
              <div className="pbar"><span style={{width:`${prog}%`,background:m.color}}/></div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Progress({ role }) {
  const modGrades = [
    {m:'CS301',n:'Algorithms & DS',g:15.8,c:'#5FA83C',w:[12,13,14,14.5,15,15.8]},
    {m:'MA205',n:'Linear Algebra', g:14.2,c:'#7CB342',w:[13,13.5,14,14.2,14.2,14.2]},
    {m:'PH210',n:'Quantum Physics',g:16.4,c:'#7C3AED',w:[14,15,15.5,16,16.2,16.4]},
    {m:'EN150',n:'Business English',g:13.9,c:'#F59E0B',w:[12,12.5,13,13.4,13.7,13.9]},
    {m:'CS420',n:'Distributed Systems',g:17.1,c:'#DC2626',w:[15,15.5,16,16.4,16.8,17.1]},
    {m:'DB310',n:'Database Systems',g:14.6,c:'#0891B2',w:[13,13.5,14,14.2,14.4,14.6]},
  ];
  const overall = (modGrades.reduce((a,m)=>a+m.g,0)/modGrades.length).toFixed(2);
  return (
    <>
      <div className="page-head"><div><h1>My progress</h1><div className="sub">Semester 1 · 2024-25</div></div><div className="page-actions"><button className="btn btn-ghost btn-sm">⤓ Transcript</button></div></div>
      <div className="grid-4" style={{marginBottom:14}}>
        <div className="stat">
          <div className="stat-h"><div className="stat-ic" style={{background:'var(--green-50)',color:'var(--green-600)'}}>◴</div></div>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <div className="stat-v" style={{margin:0}}>{overall}</div>
            <div><div style={{fontSize:11,color:'var(--text-3)',fontWeight:600}}>OUT OF 20</div><span className="badge green" style={{marginTop:4}}>Top 15%</span></div>
          </div>
          <div className="stat-l" style={{marginTop:8}}>General average</div>
        </div>
        <StatCard label="Attendance rate" value="96%" icon="✓" color="blue" trend="up" delta="+2%"/>
        <StatCard label="Modules passed" value="6/6" icon="✓" color="green" trend="flat" delta="100%"/>
        <StatCard label="Class rank" value="#4" icon="◈" color="orange" trend="up" delta="+2"/>
      </div>
      <div className="grid-2" style={{marginBottom:14}}>
        <div className="card">
          <div className="card-head"><h3>Grade evolution</h3><div className="meta">All modules · W1 → W6</div></div>
          <svg viewBox="0 0 520 220" style={{width:'100%'}}>
            {[10,12,14,16,18].map((l,i) => <g key={l}>
              <line x1="30" x2="520" y1={200-((l-10)/8)*180} y2={200-((l-10)/8)*180} stroke="#F1F5F9"/>
              <text x="0" y={204-((l-10)/8)*180} fontSize="9" fill="#94A3B8">{l}</text>
            </g>)}
            {modGrades.map(m => {
              const pts = m.w.map((v,i)=>`${30+(i/5)*480},${200-((v-10)/8)*180}`).join(' ');
              return <polyline key={m.m} points={pts} fill="none" stroke={m.c} strokeWidth="2" strokeLinejoin="round"/>;
            })}
          </svg>
          <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:10,fontSize:11}}>
            {modGrades.map(m => <span key={m.m} style={{display:'flex',alignItems:'center',gap:5,color:'var(--text-2)'}}><span style={{width:8,height:8,background:m.c,borderRadius:2}}/>{m.m}</span>)}
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h3>Module breakdown</h3></div>
          {modGrades.map((m,i,a) => (
            <div key={m.m} style={{display:'flex',alignItems:'center',gap:12,padding:'11px 0',borderBottom:i<a.length-1?'1px solid var(--border)':'0'}}>
              <div style={{width:4,height:32,background:m.c,borderRadius:2}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12.5,fontWeight:600}}>{m.n}</div>
                <div style={{fontSize:11,color:'var(--text-3)',fontFamily:'ui-monospace'}}>{m.m}</div>
              </div>
              <div style={{width:100}}><div className="pbar"><span style={{width:`${(m.g/20)*100}%`,background:m.c}}/></div></div>
              <div style={{fontSize:15,fontWeight:800,fontFamily:'var(--head-font)',color:m.c,width:44,textAlign:'right'}}>{m.g}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Users({ toast }) {
  const [search, setSearch] = uS2('');
  const list = USERS_LIST.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <>
      <div className="page-head">
        <div><h1>Users</h1><div className="sub">Manage platform accounts & permissions</div></div>
        <div className="page-actions"><button className="btn btn-ghost btn-sm">⤓ Export</button><button className="btn btn-primary btn-sm" onClick={()=>toast({title:'Invite user'})}>+ Invite user</button></div>
      </div>
      <div className="grid-4" style={{marginBottom:14}}>
        <StatCard label="Total accounts" value="42" icon="◍" color="blue" trend="up" delta="+3"/>
        <StatCard label="Faculty" value="18" icon="◴" color="green" trend="flat" delta="—"/>
        <StatCard label="Admin staff" value="6" icon="⚙" color="orange" trend="flat" delta="—"/>
        <StatCard label="Inactive" value="2" icon="◌" color="red" trend="flat" delta="—"/>
      </div>
      <div className="card" style={{padding:0}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid var(--border)',display:'flex',gap:12,alignItems:'center'}}>
          <div style={{flex:1,maxWidth:320,position:'relative'}}>
            <input placeholder="Search users…" value={search} onChange={e=>setSearch(e.target.value)} style={{width:'100%',padding:'8px 12px 8px 34px',border:'1px solid var(--border)',borderRadius:8,fontSize:13}}/>
            <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--text-3)'}}>⌕</span>
          </div>
          <div style={{fontSize:12,color:'var(--text-3)'}}>{list.length} users</div>
        </div>
        <table className="tbl">
          <thead><tr><th>User</th><th>Role</th><th>Branch</th><th>Email</th><th>Status</th><th style={{textAlign:'right'}}>Actions</th></tr></thead>
          <tbody>
            {list.map(u => (
              <tr key={u.id}>
                <td><div style={{display:'flex',alignItems:'center',gap:10}}><div className="av av-sm" style={{background:u.color}}>{u.init}</div><div><div style={{fontWeight:600}}>{u.name}</div><div style={{fontSize:11,color:'var(--text-3)',fontFamily:'ui-monospace'}}>{u.id}</div></div></div></td>
                <td><span className="badge blue">{ROLES[u.role].label}</span></td>
                <td style={{color:'var(--text-2)'}}>{u.branch}</td>
                <td style={{color:'var(--text-2)',fontSize:12.5}}>{u.email}</td>
                <td><span className={`pill ${u.status==='active'?'paid':'overdue'}`}><span className="d"/>{u.status}</span></td>
                <td style={{textAlign:'right'}}><button className="btn btn-ghost btn-sm" style={{padding:'4px 10px'}}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Groups({ toast }) {
  return (
    <>
      <div className="page-head">
        <div><h1>Groups</h1><div className="sub">Manage class groups & enrollments</div></div>
        <div className="page-actions"><button className="btn btn-primary btn-sm" onClick={()=>toast({title:'New group'})}>+ New group</button></div>
      </div>
      <div className="grid-3">
        {GROUPS_LIST.map(g => {
          const br = BRANCHES.find(b=>b.name===g.branch) || {color:'#5FA83C'};
          return (
            <div key={g.id} className="card" style={{padding:18}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
                <div className="av av-md" style={{background:br.color,borderRadius:10}}>{g.id.split('-')[0]}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:700}}>{g.name}</div>
                  <div style={{fontSize:11,color:'var(--text-3)',fontFamily:'ui-monospace'}}>{g.id} · {g.year}</div>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,padding:'12px 0',borderTop:'1px solid var(--border)',marginBottom:12}}>
                <div><div style={{fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:0.6,fontWeight:700}}>Students</div><div style={{fontSize:16,fontWeight:800,fontFamily:'var(--head-font)'}}>{g.students}</div></div>
                <div><div style={{fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:0.6,fontWeight:700}}>Branch</div><div style={{fontSize:12.5,fontWeight:600,marginTop:3}}>{g.branch}</div></div>
              </div>
              <div style={{display:'flex',gap:6}}>
                <button className="btn btn-ghost btn-sm" style={{flex:1}}>View</button>
                <button className="btn btn-primary btn-sm" style={{flex:1}}>Manage</button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Branches({ toast }) {
  return (
    <>
      <div className="page-head">
        <div><h1>Branches</h1><div className="sub">Academic departments & programs</div></div>
        <div className="page-actions"><button className="btn btn-primary btn-sm" onClick={()=>toast({title:'New branch'})}>+ New branch</button></div>
      </div>
      <div className="grid-2">
        {BRANCHES.map(b => (
          <div key={b.code} className="card" style={{padding:20,borderLeft:`3px solid ${b.color}`}}>
            <div style={{display:'flex',alignItems:'flex-start',gap:14,marginBottom:14}}>
              <div style={{width:48,height:48,borderRadius:12,background:`${b.color}18`,color:b.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:800,fontFamily:'var(--head-font)'}}>{b.code}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:700,fontFamily:'var(--head-font)'}}>{b.name}</div>
                <div style={{fontSize:12,color:'var(--text-2)',marginTop:3}}>Head: <strong>{b.head}</strong></div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,padding:'14px 0',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)',marginBottom:12}}>
              <div><div style={{fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:0.8,fontWeight:700}}>Students</div><div style={{fontSize:22,fontWeight:800,fontFamily:'var(--head-font)',color:b.color}}>{b.students}</div></div>
              <div><div style={{fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:0.8,fontWeight:700}}>Groups</div><div style={{fontSize:22,fontWeight:800,fontFamily:'var(--head-font)'}}>{b.groups}</div></div>
            </div>
            <button className="btn btn-ghost btn-sm" style={{width:'100%'}}>View details →</button>
          </div>
        ))}
      </div>
    </>
  );
}

function Notifications({ toast }) {
  const [filter, setFilter] = uS2('all');
  const list = NOTIFICATIONS.filter(n => filter==='all' || n.type===filter);
  const unread = NOTIFICATIONS.filter(n=>!n.read).length;
  return (
    <>
      <div className="page-head">
        <div><h1>Notifications</h1><div className="sub">{unread} unread · {NOTIFICATIONS.length} total</div></div>
        <div className="page-actions"><button className="btn btn-ghost btn-sm" onClick={()=>toast({title:'All marked read',type:'success'})}>Mark all read</button></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'220px 1fr',gap:14}}>
        <div className="card" style={{padding:12,height:'fit-content'}}>
          {[{k:'all',l:'All',ic:'◐'},{k:'info',l:'Info',ic:'ℹ',c:'blue'},{k:'success',l:'Success',ic:'✓',c:'green'},{k:'alert',l:'Alerts',ic:'⚠',c:'red'},{k:'reminder',l:'Reminders',ic:'⏰',c:'orange'}].map(f => {
            const count = f.k==='all'?NOTIFICATIONS.length:NOTIFICATIONS.filter(n=>n.type===f.k).length;
            return (
              <div key={f.k} className={`sb-item ${filter===f.k?'active':''}`} onClick={()=>setFilter(f.k)} style={{margin:0}}>
                <span className="ic">{f.ic}</span>
                <span className="lbl">{f.l}</span>
                <span style={{marginLeft:'auto',fontSize:11,color:'var(--text-3)',fontWeight:600}}>{count}</span>
              </div>
            );
          })}
        </div>
        <div className="card" style={{padding:10}}>
          {list.map(n => {
            const c = n.type==='alert'?'red':n.type==='success'?'green':n.type==='reminder'?'orange':'blue';
            const ic = n.type==='alert'?'⚠':n.type==='success'?'✓':n.type==='reminder'?'⏰':'ℹ';
            const clr = c==='red'?'red':c==='green'?'green-600':c==='orange'?'orange':'blue';
            const bg = c==='red'?'red':c==='green'?'green':c==='orange'?'orange':'blue';
            return (
              <div key={n.id} className={`notif ${!n.read?'unread':''}`}>
                <div className="ic" style={{background:`var(--${bg}-50)`,color:`var(--${clr})`}}>{ic}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                    <span className="t">{n.title}</span>
                    {!n.read && <span style={{width:7,height:7,borderRadius:'50%',background:'var(--blue)'}}/>}
                  </div>
                  <div className="d">{n.desc}</div>
                  <div className="tm">{n.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function Settings({ role, onLogout }) {
  const [dark, setDark] = uS2(false);
  const [twofa, setTwofa] = uS2(true);
  const [notifOn, setNotifOn] = uS2(true);
  const [emails, setEmails] = uS2(false);
  const user = ROLES[role];
  return (
    <>
      <div className="page-head"><div><h1>Settings</h1><div className="sub">Manage your account preferences</div></div></div>
      <div style={{display:'grid',gridTemplateColumns:'240px 1fr',gap:20,maxWidth:900}}>
        <div>
          {['Profile','Security','Notifications','Appearance','Sessions'].map((s,i) => <div key={s} className={`sb-item ${i===0?'active':''}`} style={{margin:'0 0 2px'}}><span className="lbl">{s}</span></div>)}
        </div>
        <div>
          <div className="card" style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:1,marginBottom:14}}>Profile</div>
            <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:18}}>
              <div className="av av-md" style={{background:user.color,width:64,height:64,fontSize:20}}>{user.name.split(' ').map(p=>p[0]).slice(0,2).join('')}</div>
              <div><div style={{fontSize:15,fontWeight:700}}>{user.name}</div><div style={{fontSize:12,color:'var(--text-2)'}}>{user.email}</div><button className="btn btn-ghost btn-sm" style={{marginTop:8}}>Upload photo</button></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div className="field"><label>Full name</label><input defaultValue={user.name}/></div>
              <div className="field"><label>Email</label><input defaultValue={user.email}/></div>
              <div className="field"><label>Role</label><input defaultValue={user.label} disabled style={{opacity:0.6}}/></div>
              <div className="field"><label>Language</label><select><option>English</option><option>Français</option><option>العربية</option></select></div>
            </div>
          </div>

          <div className="card" style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>Security</div>
            <div className="setting-row">
              <div><div className="t">Two-factor authentication</div><div className="s">Require a 6-digit code from your authenticator app at every sign-in.</div></div>
              <div className={`toggle ${twofa?'on':''}`} onClick={()=>setTwofa(!twofa)}/>
            </div>
            <div className="setting-row">
              <div><div className="t">Password</div><div className="s">Last changed 42 days ago.</div></div>
              <button className="btn btn-ghost btn-sm">Change</button>
            </div>
            <div className="setting-row">
              <div><div className="t">Active sessions</div><div className="s">2 devices currently signed in.</div></div>
              <button className="btn btn-ghost btn-sm">Review</button>
            </div>
          </div>

          <div className="card" style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>Notifications</div>
            <div className="setting-row"><div><div className="t">In-app notifications</div><div className="s">Show toast pop-ups and sidebar badge.</div></div><div className={`toggle ${notifOn?'on':''}`} onClick={()=>setNotifOn(!notifOn)}/></div>
            <div className="setting-row"><div><div className="t">Email digests</div><div className="s">Daily summary of alerts, approvals and deadlines.</div></div><div className={`toggle ${emails?'on':''}`} onClick={()=>setEmails(!emails)}/></div>
          </div>

          <div className="card" style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>Appearance</div>
            <div className="setting-row"><div><div className="t">Dark mode</div><div className="s">Coming soon — light mode default for v1.</div></div><div className={`toggle ${dark?'on':''}`} onClick={()=>setDark(!dark)}/></div>
          </div>

          <div className="card">
            <button className="btn btn-danger-soft btn-sm" onClick={onLogout}>⎋ Sign out of this session</button>
          </div>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { Modules, Progress, Users, Groups, Branches, Notifications, Settings });
