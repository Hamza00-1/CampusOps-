// CampusOps — Pages part 2: Payments, Users, Groups, Notifications, Progress, Settings
const { useState: uSP2, useMemo: uMP2, useEffect: uEP2 } = React;

// ─── PAYMENTS ───
function Payments({ role, toast }){
  const { t, lang } = useI18n();
  const [filter, setFilter] = uSP2('all');
  const me = ROLES.etudiant;
  let rows = PAYMENTS;
  if(role==='etudiant') rows = rows.filter(p=>p.student===me.name);
  if(filter!=='all') rows = rows.filter(p=>p.status===filter);
  const totals = {
    paid: PAYMENTS.filter(p=>p.status==='paid').reduce((a,p)=>a+p.amount,0),
    pending: PAYMENTS.filter(p=>p.status==='pending'||p.status==='partial').reduce((a,p)=>a+p.amount,0),
    overdue: PAYMENTS.filter(p=>p.status==='overdue').reduce((a,p)=>a+p.amount,0),
  };
  const fmt = (n) => n.toLocaleString('en-US') + ' MAD';

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('nav.Payments')}</h1>
          <div className="sub">{lang==='fr'?'Suivi des frais et paiements':'Tuition fees and payments'}</div>
        </div>
      </div>
      {role!=='etudiant' && (
        <div className="grid-3" style={{marginBottom:14}}>
          <div className="stat"><div className="stat-l">Collected</div><div className="stat-v" style={{color:'var(--green)'}}>{fmt(totals.paid)}</div></div>
          <div className="stat"><div className="stat-l">Pending</div><div className="stat-v" style={{color:'var(--orange)'}}>{fmt(totals.pending)}</div></div>
          <div className="stat"><div className="stat-l">Overdue</div><div className="stat-v" style={{color:'var(--red)'}}>{fmt(totals.overdue)}</div></div>
        </div>
      )}
      <div className="card">
        <div className="card-head">
          <div className="segment">
            <button className={filter==='all'?'active':''} onClick={()=>setFilter('all')}>All</button>
            <button className={filter==='paid'?'active':''} onClick={()=>setFilter('paid')}>{t('pay.paid')}</button>
            <button className={filter==='pending'?'active':''} onClick={()=>setFilter('pending')}>{t('pay.pending')}</button>
            <button className={filter==='overdue'?'active':''} onClick={()=>setFilter('overdue')}>{t('pay.overdue')}</button>
          </div>
          <div className="meta">{rows.length} invoices</div>
        </div>
        <table className="tbl">
          <thead><tr><th>Invoice</th><th>Student</th><th>Group</th><th>Type</th><th>Amount</th><th>Status</th><th>Due</th></tr></thead>
          <tbody>
            {rows.map(p => (
              <tr key={p.id}>
                <td className="mono" style={{fontWeight:600}}>{p.id}</td>
                <td>{p.student}</td>
                <td>{p.group}</td>
                <td>{p.type}</td>
                <td className="mono" style={{fontWeight:600}}>{fmt(p.amount)}</td>
                <td><span className={`pill ${p.status}`}><span className="d"></span>{t('pay.'+p.status, p.status)}</span></td>
                <td style={{color:'var(--text-2)',fontSize:12.5}}>{p.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── USERS ───
function Users({ toast }){
  const { t, lang } = useI18n();
  const [q, setQ] = uSP2('');
  const [roleFilter, setRoleFilter] = uSP2('all');
  const filtered = USERS_LIST.filter(u => {
    if(roleFilter!=='all' && u.role!==roleFilter) return false;
    if(q && !(u.name+' '+u.email+' '+u.branch).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('nav.Users')}</h1>
          <div className="sub">{lang==='fr'?'Tous les utilisateurs du système':'All system users'}</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm"><Icon name="plus" size={14}/>{lang==='fr'?'Inviter':'Invite user'}</button>
        </div>
      </div>
      <div className="card">
        <div className="card-head">
          <div style={{display:'flex',gap:8,alignItems:'center',flex:1,maxWidth:520}}>
            <input placeholder={lang==='fr'?'Rechercher utilisateurs…':'Search users…'} value={q} onChange={e=>setQ(e.target.value)} style={{flex:1,padding:'8px 12px',borderRadius:7,border:'1px solid var(--border)',background:'var(--surface)',color:'var(--text)',fontSize:13}}/>
            <div className="segment">
              <button className={roleFilter==='all'?'active':''} onClick={()=>setRoleFilter('all')}>All</button>
              <button className={roleFilter==='admin'?'active':''} onClick={()=>setRoleFilter('admin')}>Admin</button>
              <button className={roleFilter==='enseignant'?'active':''} onClick={()=>setRoleFilter('enseignant')}>Teachers</button>
              <button className={roleFilter==='scolarite'?'active':''} onClick={()=>setRoleFilter('scolarite')}>Scolarité</button>
            </div>
          </div>
          <div className="meta">{filtered.length} users</div>
        </div>
        <table className="tbl">
          <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Branch</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <span className="av av-sm" style={{background:u.color}}>{u.init}</span>
                    <div>
                      <div style={{fontWeight:600}}>{u.name}</div>
                      <div style={{fontSize:11,color:'var(--text-3)',fontFamily:'var(--mono)'}}>{u.id}</div>
                    </div>
                  </div>
                </td>
                <td><span className="badge gray" style={{textTransform:'capitalize'}}>{u.role}</span></td>
                <td style={{color:'var(--text-2)'}}>{u.email}</td>
                <td>{u.branch}</td>
                <td><span className={`pill ${u.status==='active'?'paid':'overdue'}`}><span className="d"></span>{u.status}</span></td>
                <td style={{textAlign:'right'}}>
                  <button className="btn btn-ghost btn-sm" onClick={()=>toast({type:'info',title:'Edit '+u.name})}><Icon name="edit" size={14}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── GROUPS ───
function Groups({ toast }){
  const { t, lang } = useI18n();
  const [view, setView] = uSP2(null);
  const [edit, setEdit] = uSP2(null);
  const [editForm, setEditForm] = uSP2({});

  const openEdit = (g) => {
    setEditForm({ id: g.id, name: g.name, branch: g.branch, year: g.year, students: g.students });
    setEdit(g);
    setView(null);
  };

  const saveEdit = () => {
    const idx = GROUPS_LIST.findIndex(g => g.id === edit.id);
    if(idx >= 0) Object.assign(GROUPS_LIST[idx], editForm);
    toast({ type:'success', title:'Group updated', desc: editForm.name + ' has been saved.' });
    setEdit(null);
  };

  const groupStudents = (g) => STUDENTS.filter(s => s.group === g.id || s.group === g.name);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('nav.Groups')}</h1>
          <div className="sub">{lang==='fr'?'Groupes et classes':'Class groups across all branches'}</div>
        </div>
        <div className="page-actions"><button className="btn btn-primary btn-sm"><Icon name="plus" size={14}/>{lang==='fr'?'Nouveau groupe':'New group'}</button></div>
      </div>
      <div className="grid-3">
        {GROUPS_LIST.map(g => {
          const studs = groupStudents(g);
          return (
            <div key={g.id} className="card">
              <div style={{fontSize:11,fontFamily:'var(--mono)',color:'var(--text-3)',fontWeight:600}}>{g.id}</div>
              <div style={{fontSize:16,fontWeight:700,marginTop:2}}>{g.name}</div>
              <div style={{fontSize:12,color:'var(--text-2)',marginTop:2}}>{g.branch} • {g.year}</div>
              <div style={{display:'flex',gap:14,marginTop:14,fontSize:12,color:'var(--text-2)'}}>
                <div><div style={{fontSize:18,fontWeight:800,color:'var(--text)',fontFamily:'var(--head-font)'}}>{g.students}</div>Students</div>
                <div><div style={{fontSize:18,fontWeight:800,color:'var(--text)',fontFamily:'var(--head-font)'}}>{studs.filter(s=>s.status==='active').length}</div>Active</div>
              </div>
              <div style={{marginTop:14,display:'flex',gap:6}}>
                <button className="btn btn-ghost btn-sm" onClick={()=>setView(g)}><Icon name="eye" size={14}/>View</button>
                <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(g)}><Icon name="edit" size={14}/>{t('btn.edit')}</button>
              </div>
            </div>
          );
        })}
      </div>

      {view && (
        <>
          <div className="drawer-bg open" onClick={()=>setView(null)}></div>
          <div className="drawer open">
            <div className="drawer-head">
              <div>
                <div style={{fontSize:16,fontWeight:700}}>{view.name}</div>
                <div style={{fontSize:12,color:'var(--text-3)',fontFamily:'var(--mono)'}}>{view.id} • {view.branch}</div>
              </div>
              <button className="tb-btn" onClick={()=>setView(null)}><Icon name="close" size={16}/></button>
            </div>
            <div className="drawer-body">
              {(() => {
                const studs = groupStudents(view);
                return (
                  <>
                    <h4 style={{fontSize:12,textTransform:'uppercase',letterSpacing:1,color:'var(--text-3)',marginBottom:10,fontWeight:700}}>
                      Students ({studs.length || view.students})
                    </h4>
                    {studs.length === 0 && (
                      <div style={{fontSize:13,color:'var(--text-3)',padding:'12px 0'}}>
                        {view.students > 0 ? `${view.students} students enrolled (details not loaded).` : 'No students in this group.'}
                      </div>
                    )}
                    {studs.map(s => (
                      <div key={s.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                        <span className="av av-sm" style={{background:s.color}}>{s.init}</span>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:600,fontSize:13}}>{s.name}</div>
                          <div style={{fontSize:11,color:'var(--text-3)',fontFamily:'var(--mono)'}}>{s.id}</div>
                        </div>
                        <div className="mono" style={{fontSize:13,fontWeight:600,color:s.avg>=14?'var(--green)':s.avg>=10?'var(--orange)':'var(--red)'}}>{s.avg.toFixed(1)}</div>
                      </div>
                    ))}
                  </>
                );
              })()}
            </div>
            <div className="drawer-foot">
              <button className="btn btn-ghost" onClick={()=>setView(null)}>{t('btn.close')}</button>
              <button className="btn btn-primary" onClick={()=>openEdit(view)}>{t('btn.edit')}</button>
            </div>
          </div>
        </>
      )}

      {edit && (
        <>
          <div className="drawer-bg open" onClick={()=>setEdit(null)}></div>
          <div className="modal open">
            <div className="modal-head">
              <h3 style={{fontSize:16}}>{lang==='fr'?'Modifier groupe':'Edit group'} — {edit.name}</h3>
              <button className="tb-btn" onClick={()=>setEdit(null)}><Icon name="close" size={16}/></button>
            </div>
            <div className="modal-body">
              <div className="grid-2">
                <div className="field"><label>Group ID</label><input value={editForm.id||''} onChange={e=>setEditForm(f=>({...f,id:e.target.value}))}/></div>
                <div className="field"><label>Name</label><input value={editForm.name||''} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))}/></div>
                <div className="field">
                  <label>Branch</label>
                  <select value={editForm.branch||''} onChange={e=>setEditForm(f=>({...f,branch:e.target.value}))}>
                    {BRANCHES.map(b=><option key={b.code} value={b.name}>{b.name}</option>)}
                  </select>
                </div>
                <div className="field"><label>Academic year</label><input value={editForm.year||''} onChange={e=>setEditForm(f=>({...f,year:e.target.value}))}/></div>
                <div className="field" style={{gridColumn:'1/-1'}}><label>Capacity</label><input type="number" value={editForm.students||0} onChange={e=>setEditForm(f=>({...f,students:parseInt(e.target.value)||0}))}/></div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={()=>setEdit(null)}>{t('btn.cancel')}</button>
              <button className="btn btn-primary" onClick={saveEdit}>{t('btn.save')}</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ─── NOTIFICATIONS ───
function Notifications({ toast }){
  const { t, lang } = useI18n();
  const [filter, setFilter] = uSP2('all');
  const [items, setItems] = uSP2(NOTIFICATIONS);
  const filtered = items.filter(n => filter==='all' || (filter==='unread' && !n.read) || filter===n.type);
  const markAll = () => { setItems(items.map(i=>({...i, read:true}))); toast({type:'success',title:'All notifications marked as read'}); };
  const markOne = (id) => setItems(items.map(i => i.id===id?{...i,read:true}:i));

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('nav.Notifications')}</h1>
          <div className="sub">{items.filter(n=>!n.read).length} {lang==='fr'?'non lues':'unread'}</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost btn-sm" onClick={markAll}>{t('btn.markAllRead')}</button>
        </div>
      </div>
      <div style={{display:'flex',gap:8,marginBottom:14}}>
        <div className="segment">
          <button className={filter==='all'?'active':''} onClick={()=>setFilter('all')}>All</button>
          <button className={filter==='unread'?'active':''} onClick={()=>setFilter('unread')}>Unread</button>
          <button className={filter==='alert'?'active':''} onClick={()=>setFilter('alert')}>Alerts</button>
          <button className={filter==='reminder'?'active':''} onClick={()=>setFilter('reminder')}>Reminders</button>
          <button className={filter==='success'?'active':''} onClick={()=>setFilter('success')}>Success</button>
        </div>
      </div>
      <div>
        {filtered.length===0 && <div className="card"><div className="empty">No notifications match this filter.</div></div>}
        {filtered.map(n => (
          <div key={n.id} className={`notif t-${n.type} ${n.read?'':'unread'}`} onClick={()=>markOne(n.id)}>
            <span className="dot"></span>
            <div className="body">
              <div className="t">
                {n.title}
                {!n.read && <span className="unread-dot"></span>}
              </div>
              <div className="d">{n.desc}</div>
              <div className="tm">{n.time}</div>
              {n.actions && (
                <div className="actions">
                  {n.actions.map((a,i) => <button key={i} onClick={(e)=>{e.stopPropagation(); toast({type:'info',title:a});}}>{a}</button>)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── PROGRESS ───
function Progress({ role }){
  const { t, lang } = useI18n();
  if(role==='etudiant'){
    const me = ROLES.etudiant;
    const overall = (STUDENT_GRADES.reduce((a,g)=>a+g.average,0)/STUDENT_GRADES.length).toFixed(2);
    return (
      <>
        <div className="page-head">
          <div>
            <h1>{t('nav.Progress')}</h1>
            <div className="sub">{me.name} — Group {me.group}</div>
          </div>
        </div>
        <div className="grid-4" style={{marginBottom:14}}>
          <div className="stat"><div className="stat-l">{t('grade.overall')}</div><div className="stat-v" style={{color:'var(--green)'}}>{overall}</div></div>
          <div className="stat"><div className="stat-l">Modules passed</div><div className="stat-v">{STUDENT_GRADES.filter(g=>g.average>=10).length}/{STUDENT_GRADES.length}</div></div>
          <div className="stat"><div className="stat-l">Attendance</div><div className="stat-v">96%</div></div>
          <div className="stat"><div className="stat-l">Rank</div><div className="stat-v">3rd</div></div>
        </div>
        <div className="card">
          <div className="card-head"><h3>Module breakdown</h3></div>
          <table className="tbl">
            <thead><tr><th>Module</th><th>Average</th><th>Status</th></tr></thead>
            <tbody>
              {STUDENT_GRADES.map(g => (
                <tr key={g.module}>
                  <td><strong>{g.name}</strong> <span style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--text-3)',marginLeft:8}}>{g.module}</span></td>
                  <td className="mono" style={{fontWeight:700,fontSize:14,color:g.average>=14?'var(--green)':g.average>=10?'var(--orange)':'var(--red)'}}>{g.average.toFixed(2)}</td>
                  <td><span className={`pill ${g.average>=14?'paid':g.average>=10?'partial':'overdue'}`}><span className="d"></span>{g.average>=14?'Excellent':g.average>=10?'Passing':'At risk'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('nav.Progress')}</h1>
          <div className="sub">{lang==='fr'?'Suivi de progression':'Academic progress overview'}</div>
        </div>
      </div>
      <div className="card">
        <div className="card-head"><h3>Students at a glance</h3></div>
        <table className="tbl">
          <thead><tr><th>Student</th><th>Group</th><th>Average</th><th>Attendance</th><th>Status</th></tr></thead>
          <tbody>
            {STUDENTS.map(s => (
              <tr key={s.id}>
                <td>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <span className="av av-sm" style={{background:s.color}}>{s.init}</span>
                    <div style={{fontWeight:600}}>{s.name}</div>
                  </div>
                </td>
                <td>{s.group}</td>
                <td className="mono" style={{fontWeight:600,color:s.avg>=14?'var(--green)':s.avg>=10?'var(--orange)':'var(--red)'}}>{s.avg.toFixed(1)}</td>
                <td className="mono">{s.att}%</td>
                <td><span className={`pill ${s.status==='active'?'paid':'overdue'}`}><span className="d"></span>{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── SETTINGS ───
function Settings({ role, onLogout, theme, setTheme, lang, setLang, toast }){
  const { t } = useI18n();
  const [tab, setTab] = uSP2('account');
  const [phone, setPhone] = uSP2(() => localStorage.getItem('co2_phone') || '');
  const [density, setDensity] = uSP2(() => localStorage.getItem('co2_density') || 'comfortable');
  const r = ROLES[role];

  uEP2(() => {
    document.documentElement.setAttribute('data-density', density);
  }, [density]);

  const applyDensity = (d) => {
    setDensity(d);
    localStorage.setItem('co2_density', d);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('nav.Settings')}</h1>
          <div className="sub">{lang==='fr'?'Préférences et compte':'Preferences and account'}</div>
        </div>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'220px 1fr', gap:18}}>
        <div className="card" style={{padding:10, alignSelf:'flex-start'}}>
          <div className="settings-nav">
            <button className={`tab ${tab==='account'?'active':''}`} onClick={()=>setTab('account')}><Icon name="users" size={16}/>{t('set.account')}</button>
            <button className={`tab ${tab==='security'?'active':''}`} onClick={()=>setTab('security')}><Icon name="lock" size={16}/>{t('set.security')}</button>
            <button className={`tab ${tab==='appearance'?'active':''}`} onClick={()=>setTab('appearance')}><Icon name="palette" size={16}/>{t('set.appearance')}</button>
            <button className={`tab ${tab==='notifications'?'active':''}`} onClick={()=>setTab('notifications')}><Icon name="bell" size={16}/>{t('set.notifications')}</button>
            <button className={`tab ${tab==='sessions'?'active':''}`} onClick={()=>setTab('sessions')}><Icon name="device" size={16}/>{t('set.sessions')}</button>
          </div>
        </div>
        <div className="card">
          {tab==='account' && (
            <div>
              <h3 style={{marginBottom:14}}>{t('set.account')}</h3>
              <div style={{display:'flex',alignItems:'center',gap:14,paddingBottom:18,borderBottom:'1px solid var(--border)',marginBottom:14}}>
                <div className="av av-md" style={{background:r.color, width:64, height:64, fontSize:20}}>{r.name.split(' ').map(p=>p[0]).slice(0,2).join('')}</div>
                <div>
                  <div style={{fontSize:18,fontWeight:700}}>{r.name}</div>
                  <div style={{fontSize:13,color:'var(--text-2)'}}>{r.email}</div>
                  <div style={{fontSize:12,color:'var(--text-3)',marginTop:2}}>{r.label}{r.field?` — ${r.field}`:''}</div>
                </div>
              </div>
              <div className="grid-2">
                <div className="field"><label>Full name</label><input defaultValue={r.name}/></div>
                <div className="field"><label>Email</label><input defaultValue={r.email}/></div>
                <div className="field">
                  <label>Phone</label>
                  <input
                    value={phone}
                    onChange={e=>setPhone(e.target.value)}
                    placeholder="+212 …"
                  />
                </div>
                <div className="field"><label>{t('set.language')}</label><select value={lang} onChange={e=>setLang(e.target.value)}><option value="en">English</option><option value="fr">Français</option></select></div>
              </div>
              <div style={{marginTop:14,display:'flex',justifyContent:'flex-end'}}>
                <button className="btn btn-primary" onClick={()=>{ localStorage.setItem('co2_phone', phone); toast({type:'success',title:'Profile saved', desc:'Your changes have been saved.'}); }}>{t('btn.save')}</button>
              </div>
            </div>
          )}
          {tab==='security' && (
            <div>
              <h3 style={{marginBottom:14}}>{t('set.security')}</h3>
              <div className="setting-row">
                <div><div className="t">{t('set.changePassword')}</div><div className="s">Use at least 12 characters with a mix of letters, numbers and symbols.</div></div>
                <button className="btn btn-ghost btn-sm" onClick={()=>toast({type:'info',title:'Password reset email sent'})}>Change</button>
              </div>
              <div className="setting-row">
                <div><div className="t">{t('set.2fa')}</div><div className="s">Add an extra layer of security using an authenticator app or SMS code.</div></div>
                <button className="toggle" onClick={(e)=>{e.currentTarget.classList.toggle('on'); toast({type:'success',title:'2FA toggled'});}}></button>
              </div>
              <div className="setting-row">
                <div><div className="t">Login alerts</div><div className="s">Email me when there's a sign-in from a new device or location.</div></div>
                <button className="toggle on"></button>
              </div>
              <div className="setting-row">
                <div><div className="t">API tokens</div><div className="s">Manage personal access tokens for integrations.</div></div>
                <button className="btn btn-ghost btn-sm">Manage</button>
              </div>
            </div>
          )}
          {tab==='appearance' && (
            <div>
              <h3 style={{marginBottom:14}}>{t('set.appearance')}</h3>
              <div className="setting-row">
                <div><div className="t">Theme</div><div className="s">Choose how CampusOps looks. System matches your OS preference.</div></div>
                <div className="segment">
                  <button className={theme==='light'?'active':''} onClick={()=>setTheme('light')}>{t('set.lightMode')}</button>
                  <button className={theme==='dark'?'active':''} onClick={()=>setTheme('dark')}>{t('set.darkMode')}</button>
                </div>
              </div>
              <div className="setting-row">
                <div><div className="t">{t('set.language')}</div><div className="s">Interface language for menus, tables and forms.</div></div>
                <div className="segment">
                  <button className={lang==='en'?'active':''} onClick={()=>setLang('en')}>English</button>
                  <button className={lang==='fr'?'active':''} onClick={()=>setLang('fr')}>Français</button>
                </div>
              </div>
              <div className="setting-row">
                <div><div className="t">Density</div><div className="s">Comfortable spacing or compact for more on screen.</div></div>
                <div className="segment">
                  <button className={density==='comfortable'?'active':''} onClick={()=>applyDensity('comfortable')}>Comfortable</button>
                  <button className={density==='compact'?'active':''} onClick={()=>applyDensity('compact')}>Compact</button>
                </div>
              </div>
              <div className="setting-row">
                <div><div className="t">Reduce motion</div><div className="s">Disable non-essential animations and transitions.</div></div>
                <button className="toggle"></button>
              </div>
            </div>
          )}
          {tab==='notifications' && (
            <div>
              <h3 style={{marginBottom:14}}>{t('set.notifications')}</h3>
              {[
                ['Email — daily digest','One email summarising activity since yesterday.', true],
                ['Email — alerts only','Just absence/payment alerts, real-time.', true],
                ['Browser push','Show desktop notifications in this browser.', false],
                ['Grade submission reminders','Notify before grading deadlines.', true],
                ['Payment reminders','Notify when invoices become overdue.', true],
              ].map(([title,sub,on],i) => (
                <div key={i} className="setting-row">
                  <div><div className="t">{title}</div><div className="s">{sub}</div></div>
                  <button className={`toggle ${on?'on':''}`} onClick={(e)=>e.currentTarget.classList.toggle('on')}></button>
                </div>
              ))}
            </div>
          )}
          {tab==='sessions' && (
            <div>
              <h3 style={{marginBottom:14}}>{t('set.activeSessions')}</h3>
              {[
                ['MacBook Pro — Chrome','Casablanca, Morocco','Active now',true],
                ['iPhone 15 — Safari','Casablanca, Morocco','3 hours ago',false],
                ['Windows — Firefox','Rabat, Morocco','2 days ago',false],
              ].map(([d,loc,tm,cur],i)=> (
                <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 0',borderBottom:'1px solid var(--border)'}}>
                  <div style={{width:40,height:40,borderRadius:10,background:'var(--hover)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-2)'}}><Icon name="device" size={18}/></div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:13.5}}>{d} {cur && <span className="badge green" style={{marginLeft:8}}>This device</span>}</div>
                    <div style={{fontSize:12,color:'var(--text-3)'}}>{loc} • {tm}</div>
                  </div>
                  {!cur && <button className="btn btn-ghost btn-sm" onClick={()=>toast({type:'success',title:'Session revoked'})}>Revoke</button>}
                </div>
              ))}
              <div style={{marginTop:18,display:'flex',justifyContent:'flex-end',gap:8}}>
                <button className="btn btn-danger-soft btn-sm" onClick={()=>{ toast({type:'warn',title:'Signed out everywhere'}); setTimeout(onLogout, 500); }}>{t('set.signOutAll')}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

Object.assign(window, { Payments, Users, Groups, Notifications, Progress, Settings });
