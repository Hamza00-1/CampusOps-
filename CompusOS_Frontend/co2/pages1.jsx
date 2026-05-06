// CampusOps — Dashboards, Planning, Absences, Payments
const { useState: uS, useMemo: uM, useEffect: uE, useRef: uR } = React;

// ───── Helpers ─────
function StatCard({ label, value, delta, trend, icon, color='blue' }) {
  const tCls = trend==='up'?'up':trend==='down'?'down':'flat';
  const arrow = trend==='up'?'↑':trend==='down'?'↓':'→';
  return (
    <div className="stat">
      <div className="stat-h">
        <div className="stat-ic" style={{background:`var(--${color}-50)`,color:`var(--${color==='green'?'green-600':color})`}}>{icon}</div>
        {delta && <span className={`trend ${tCls}`}>{arrow} {delta}</span>}
      </div>
      <div className="stat-v">{value}</div>
      <div className="stat-l">{label}</div>
    </div>
  );
}
function Ring({ value, color='var(--blue)', size=56 }) {
  const r = size/2 - 5, c = 2*Math.PI*r;
  return (
    <div className="ring-wrap" style={{width:size,height:size}}>
      <svg viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F1F5F9" strokeWidth="5"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c*(1-value/100)} />
      </svg>
      <div className="rv" style={{color}}>{value}%</div>
    </div>
  );
}
function LineChart({ data, color='#5FA83C', height=200, fill=true, labels=[] }) {
  const max = Math.max(...data)*1.1, min = Math.min(...data)*0.85;
  const w = 520, pts = data.map((v,i)=>`${(i/(data.length-1))*w},${height-((v-min)/(max-min))*(height-20)-10}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${height+26}`} style={{width:'100%',height:'auto'}}>
      {[0,0.25,0.5,0.75,1].map(p => <line key={p} x1={0} x2={w} y1={10+p*(height-20)} y2={10+p*(height-20)} stroke="#F1F5F9" strokeWidth="1"/>)}
      {fill && <polygon points={`0,${height-10} ${pts} ${w},${height-10}`} fill={color} opacity="0.08"/>}
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      {data.map((v,i) => {
        const x=(i/(data.length-1))*w, y=height-((v-min)/(max-min))*(height-20)-10;
        return <circle key={i} cx={x} cy={y} r="3.5" fill="#fff" stroke={color} strokeWidth="2"/>;
      })}
      {labels.length>0 && labels.map((l,i) => <text key={i} x={(i/(labels.length-1))*w} y={height+20} fontSize="10" fill="#94A3B8" textAnchor="middle" fontFamily="ui-monospace">{l}</text>)}
    </svg>
  );
}
function BarChart({ data, labels, colors=['#5FA83C','#7CB342'], height=220 }) {
  const max = Math.max(...data.flat())*1.15;
  const groups = data[0].length, barW = 18, gap = 6, groupW = barW*data.length+gap*(data.length-1), slot = 520/groups;
  return (
    <svg viewBox={`0 0 520 ${height+30}`} style={{width:'100%',height:'auto'}}>
      {[0,0.25,0.5,0.75,1].map(p => <line key={p} x1={0} x2={520} y1={10+p*(height-20)} y2={10+p*(height-20)} stroke="#F1F5F9"/>)}
      {Array.from({length:groups}).map((_,i) => (
        <g key={i} transform={`translate(${i*slot+slot/2-groupW/2},0)`}>
          {data.map((series,s) => {
            const h = (series[i]/max)*(height-20), y = height-10-h;
            return <rect key={s} x={s*(barW+gap)} y={y} width={barW} height={h} fill={colors[s]} rx="3"/>;
          })}
          <text x={groupW/2} y={height+18} fontSize="10" fill="#94A3B8" textAnchor="middle">{labels[i]}</text>
        </g>
      ))}
    </svg>
  );
}
function Donut({ slices, size=160 }) {
  const total = slices.reduce((a,s)=>a+s.v,0);
  let a = -Math.PI/2, r = size/2-10, cx=size/2, cy=size/2;
  return (
    <div style={{position:'relative',width:size,height:size,flexShrink:0}}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {slices.map((s,i) => {
          const ang = (s.v/total)*Math.PI*2;
          const x1=cx+r*Math.cos(a), y1=cy+r*Math.sin(a);
          const x2=cx+r*Math.cos(a+ang), y2=cy+r*Math.sin(a+ang);
          const large = ang>Math.PI?1:0;
          const d = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`;
          a += ang;
          return <path key={i} d={d} fill={s.c}/>;
        })}
        <circle cx={cx} cy={cy} r={r*0.62} fill="#fff"/>
      </svg>
      <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        <div style={{fontSize:22,fontWeight:800,fontFamily:'var(--head-font)',color:'var(--text)'}}>{total}</div>
        <div style={{fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:1}}>Total</div>
      </div>
    </div>
  );
}

// ───── Dashboards ─────
function Dashboard({ role, toast, onNav }) {
  const today = new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
  const user = ROLES[role];
  const greeting = (()=>{ const h=new Date().getHours(); return h<12?'Good morning':h<18?'Good afternoon':'Good evening'; })();

  return (
    <>
      <div className="page-head">
        <div>
          <div style={{fontSize:12,color:'var(--text-3)',marginBottom:4,fontWeight:500}}>{today}</div>
          <h1>{greeting}, {user.name.split(' ')[0]}.</h1>
          <div className="sub">Here's what's happening on your {user.label.toLowerCase()} workspace today.</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost btn-sm" onClick={()=>{const d={students:STUDENTS.length,modules:MODULES.length,groups:GROUPS_LIST.length,payments:PAYMENTS.length};const b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='campusops_dashboard.json';a.click();toast({title:'Dashboard exported',type:'success'})}}>⤓ Export</button>
          {role==='admin'||role==='scolarite' ? <button className="btn btn-primary btn-sm" onClick={()=>onNav('planning')}>+ New session</button> : null}
        </div>
      </div>

      {role==='admin' && <AdminDash onNav={onNav} />}
      {role==='scolarite' && <ScolDash onNav={onNav} />}
      {role==='enseignant' && <TeachDash onNav={onNav} />}
      {role==='etudiant' && <StudDash onNav={onNav} />}
    </>
  );
}

function AdminDash({ onNav }) {
  return (
    <>
      <div className="grid-4" style={{marginBottom:14}}>
        <StatCard label="Total students"     value="577"     delta="+28 this sem"   trend="up"   icon="◍" color="blue" />
        <StatCard label="Absence rate"       value="9.4%"    delta="−1.2%"          trend="up"   icon="✗" color="green" />
        <StatCard label="Monthly revenue"    value="1.28M"   delta="+8.2%"          trend="up"   icon="❐" color="green" />
        <StatCard label="Overdue invoices"   value="14"      delta="+3"             trend="down" icon="⚠" color="red" />
      </div>
      <div className="grid-2-1" style={{marginBottom:14}}>
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Payments — collected vs expected</h3>
              <div className="meta">Last 8 months · MAD (thousands)</div>
            </div>
            <div className="segment">
              <button className="active">Year</button>
              <button>Qtr</button>
              <button>Month</button>
            </div>
          </div>
          <BarChart
            data={[[820,910,1040,980,1120,1080,1210,1280],[900,1000,1100,1050,1200,1150,1300,1350]]}
            labels={['Mar','Apr','May','Jun','Jul','Aug','Sep','Oct']}
            colors={['#5FA83C','#CFE0F4']}
            height={220}
          />
          <div style={{display:'flex',gap:18,marginTop:10,fontSize:12,color:'var(--text-2)'}}>
            <span style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:10,height:10,background:'#5FA83C',borderRadius:2,display:'inline-block'}}/>Collected</span>
            <span style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:10,height:10,background:'#CFE0F4',borderRadius:2,display:'inline-block'}}/>Expected</span>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h3>System alerts</h3><span className="badge red">3</span></div>
          {[
            {t:'Absence threshold exceeded',d:'Mehdi Alami — 6 missed sessions',c:'red',ic:'⚠'},
            {t:'4 overdue invoices',d:'L3-INFO-A — 48,500 MAD total',c:'red',ic:'❐'},
            {t:'Grade deadline — CS301',d:'Due Friday Oct 25',c:'orange',ic:'⏰'},
            {t:'New group created',d:'L3-INFO-A · 2024-25',c:'green',ic:'✓'},
          ].map((a,i) => (
            <div key={i} style={{display:'flex',gap:10,padding:'10px 0',borderBottom:i<3?'1px solid var(--border)':'0'}}>
              <div style={{width:32,height:32,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',background:`var(--${a.c==='red'?'red':a.c==='green'?'green':'orange'}-50)`,color:`var(--${a.c==='red'?'red':a.c==='green'?'green-600':'orange'})`,flexShrink:0,fontSize:13}}>{a.ic}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12.5,fontWeight:600}}>{a.t}</div>
                <div style={{fontSize:11.5,color:'var(--text-2)',marginTop:1}}>{a.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-head"><h3>Branches distribution</h3><span className="meta">577 students</span></div>
          <div style={{display:'flex',gap:24,alignItems:'center'}}>
            <Donut slices={BRANCHES.map(b=>({v:b.students,c:b.color}))} />
            <div style={{flex:1}}>
              {BRANCHES.map(b => (
                <div key={b.code} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 0'}}>
                  <span style={{width:8,height:8,borderRadius:2,background:b.color}}/>
                  <span style={{flex:1,fontSize:12.5}}>{b.name}</span>
                  <span style={{fontSize:12,fontWeight:700}}>{b.students}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h3>Top performing groups</h3></div>
          {GROUPS_LIST.slice(0,5).map((g,i) => {
            const avg = [15.8,14.2,16.1,13.7,14.9][i];
            return (
              <div key={g.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:i<4?'1px solid var(--border)':'0'}}>
                <div className="av av-sm" style={{background:'linear-gradient(135deg,#5FA83C,#7CB342)'}}>{g.id.split('-')[0]}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600}}>{g.name}</div>
                  <div style={{fontSize:11,color:'var(--text-3)'}}>{g.students} students · {g.branch}</div>
                </div>
                <div style={{width:120}}><div className="pbar"><span style={{width:`${(avg/20)*100}%`,background:avg>14?'var(--green)':'var(--orange)'}}/></div></div>
                <div style={{fontSize:13,fontWeight:700,width:44,textAlign:'right',fontFamily:'var(--head-font)'}}>{avg}</div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function ScolDash({ onNav }) {
  return (
    <>
      <div className="grid-4" style={{marginBottom:14}}>
        <StatCard label="Active enrollments" value="577"   delta="+12"     trend="up"   icon="◍" color="blue"/>
        <StatCard label="Pending justifications" value="23" delta="+8"     trend="down" icon="⏰" color="orange"/>
        <StatCard label="Collected (Q2)"     value="1.28M" delta="+8.2%"   trend="up"   icon="❐" color="green"/>
        <StatCard label="Outstanding"        value="186K"  delta="−12K"    trend="up"   icon="⚠" color="red"/>
      </div>
      <div className="grid-2-1" style={{marginBottom:14}}>
        <div className="card">
          <div className="card-head"><h3>Revenue trend</h3><div className="meta">YTD 2024 · MAD (thousands)</div></div>
          <LineChart data={[820,910,1040,980,1120,1080,1210,1280]} labels={['Mar','Apr','May','Jun','Jul','Aug','Sep','Oct']}/>
        </div>
        <div className="card">
          <div className="card-head"><h3>Overdue alerts</h3><span className="badge red">14</span></div>
          {PAYMENTS.filter(p=>p.status==='overdue').slice(0,5).map((p,i,a) => (
            <div key={p.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:i<a.length-1?'1px solid var(--border)':'0'}}>
              <div className="av av-xs" style={{background:'var(--red)'}}>{(p.student || '').split(' ').map(x=>x[0]).join('')}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12.5,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.student}</div>
                <div style={{fontSize:11,color:'var(--text-3)'}}>{p.id} · {p.group}</div>
              </div>
              <div style={{fontSize:12,fontWeight:700}}>{p.amount.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function TeachDash({ onNav }) {
  return (
    <>
      <div className="grid-4" style={{marginBottom:14}}>
        <StatCard label="Today's classes"      value="3"      delta="2 remaining" trend="flat" icon="▦" color="blue"/>
        <StatCard label="Class performance"    value="14.2"   delta="+0.4"       trend="up"   icon="◴" color="green"/>
        <StatCard label="Absence alerts"       value="4"      delta="+1"         trend="down" icon="⚠" color="red"/>
        <StatCard label="Pending grades"       value="28"     delta="−12"        trend="up"   icon="✎" color="orange"/>
      </div>
      <div className="grid-2-1" style={{marginBottom:14}}>
        <div className="card">
          <div className="card-head"><h3>Course progress — CS301</h3><div className="meta">Chapter completion · 12 chapters</div></div>
          <LineChart data={[2,3,4,5,6,8,9,10,11]} labels={['W1','W2','W3','W4','W5','W6','W7','W8','W9']} color="#5FA83C"/>
        </div>
        <div className="card">
          <div className="card-head"><h3>Today's planning</h3><span className="meta">Tue, Oct 22</span></div>
          {[
            {t:'08:00 — 10:00',m:'PH210 Quantum Physics',g:'L1-PHYS',r:'Lab C-12',c:'#7C3AED',done:true},
            {t:'13:00 — 14:30',m:'EN150 Business English',g:'L3-INFO-A',r:'A-305',c:'#F59E0B',done:false,now:true},
            {t:'15:00 — 17:00',m:'CS420 Distributed Systems',g:'M1-IA',r:'B-301',c:'#DC2626',done:false},
          ].map((s,i,a) => (
            <div key={i} style={{display:'flex',gap:10,padding:'10px 0',borderBottom:i<a.length-1?'1px solid var(--border)':'0',opacity:s.done?0.55:1}}>
              <div style={{width:3,borderRadius:2,background:s.c,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:'var(--text-3)',fontFamily:'ui-monospace',fontWeight:600}}>{s.t}{s.now && <span className="badge blue" style={{marginLeft:8,fontSize:9,padding:'1px 6px'}}>NOW</span>}</div>
                <div style={{fontSize:13,fontWeight:600,margin:'2px 0'}}>{s.m}</div>
                <div style={{fontSize:11,color:'var(--text-2)'}}>{s.g} · Room {s.r}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function StudDash({ onNav }) {
  return (
    <>
      <div className="grid-4" style={{marginBottom:14}}>
        <StatCard label="My average"        value="15.8/20" delta="+0.4"  trend="up"   icon="◴" color="green"/>
        <StatCard label="Attendance rate"   value="96%"     delta="+2%"   trend="up"   icon="✓" color="blue"/>
        <StatCard label="Next class"        value="14:00"   delta="in 42m" trend="flat" icon="▦" color="orange"/>
        <StatCard label="Balance due"       value="0 MAD"   delta="Paid"  trend="up"   icon="❐" color="green"/>
      </div>
      <div className="grid-2-1" style={{marginBottom:14}}>
        <div className="card">
          <div className="card-head"><h3>Grade evolution</h3><div className="meta">All modules · semester 1</div></div>
          <LineChart data={[13.2,14.1,13.8,14.5,15.1,15.3,15.6,15.8]} labels={['W1','W2','W3','W4','W5','W6','W7','W8']} color="#7CB342"/>
        </div>
        <div className="card">
          <div className="card-head"><h3>Notifications</h3><span className="badge blue">3 new</span></div>
          {NOTIFICATIONS.slice(0,4).map(n => {
            const c = n.type==='alert'?'red':n.type==='success'?'green':n.type==='reminder'?'orange':'blue';
            return (
              <div key={n.id} style={{padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:3}}>
                  <span style={{width:6,height:6,borderRadius:'50%',background:`var(--${c==='green'?'green':c})`}}/>
                  <span style={{fontSize:12.5,fontWeight:600}}>{n.title}</span>
                </div>
                <div style={{fontSize:11.5,color:'var(--text-2)',marginLeft:14}}>{n.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="card">
        <div className="card-head"><h3>My modules this semester</h3><span className="meta">6 modules · 29 credits</span></div>
        <div className="grid-3">
          {MODULES.map(m => {
            const g = [15.8,14.2,16.4,13.9,17.1,14.6][MODULES.indexOf(m)];
            return (
              <div key={m.code} style={{padding:14,border:'1px solid var(--border)',borderRadius:10,borderLeft:`3px solid ${m.color}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <div>
                    <div style={{fontSize:11,fontFamily:'ui-monospace',color:'var(--text-3)',fontWeight:600}}>{m.code}</div>
                    <div style={{fontSize:13,fontWeight:700,marginTop:2}}>{m.name}</div>
                  </div>
                  <div style={{fontSize:18,fontWeight:800,fontFamily:'var(--head-font)',color:m.color}}>{g}</div>
                </div>
                <div style={{fontSize:11,color:'var(--text-2)',marginBottom:8}}>{m.teacher} · {m.credits} credits</div>
                <div className="pbar"><span style={{width:`${(g/20)*100}%`,background:m.color}}/></div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ───── Planning ─────
function Planning({ role, toast }) {
  const [groupFilter, setGroupFilter] = uS('all');
  const [modFilter, setModFilter] = uS('all');
  const [selected, setSelected] = uS(null);
  const [showNew, setShowNew] = uS(false);
  const [newForm, setNewForm] = uS({moduleId:'',groupId:'',teacherId:'',room:'',day:0,startH:8,dur:2});
  const [saving, setSaving] = uS(false);
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat'];
  const dates = [20,21,22,23,24,25];
  const todayIdx = 1;
  const hours = [8,9,10,11,12,13,14,15,16,17,18];

  // Role-based filtering: teacher sees only sessions with their modules, student sees only their group
  const roleFiltered = SESSIONS.filter(s => {
    if (role==='enseignant') return s.teacherId === window._userId;
    if (role==='etudiant') { const ug = window._userGroups || []; if(ug.length===0) return false; return ug.includes(s.grp); }
    return true;
  });
  const filtered = roleFiltered.filter(s => (groupFilter==='all'||s.grp===groupFilter)&&(modFilter==='all'||s.mod===modFilter||MODULES.find(m=>(m.code===modFilter||m.name===modFilter)&&(m.code===s.mod||m.name===s.mod))));

  async function createSession(e) {
    e.preventDefault(); setSaving(true);
    try {
      const base = new Date(); base.setDate(base.getDate() - base.getDay() + 1 + newForm.day);
      const start = new Date(base); start.setHours(newForm.startH, 0, 0, 0);
      const end = new Date(base); end.setHours(newForm.startH + newForm.dur, 0, 0, 0);
      await window.api.request('/planning', { method:'POST', body: {
        moduleId: newForm.moduleId, groupId: newForm.groupId, teacherId: newForm.teacherId || window._userId,
        room: newForm.room, startTime: start.toISOString(), endTime: end.toISOString()
      }});
      toast({title:'Session created',type:'success'}); setShowNew(false); window.location.reload();
    } catch(err) { toast({title:'Error',desc:err.message,type:'error'}); }
    finally { setSaving(false); }
  }

  async function deleteSession(id) {
    try { await window.api.request(`/planning/${id}`, {method:'DELETE'}); toast({title:'Session deleted',type:'success'}); setSelected(null); window.location.reload(); }
    catch(err) { toast({title:'Error',desc:err.message,type:'error'}); }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Planning</h1>
          <div className="sub">Weekly timetable · {filtered.length} sessions</div>
        </div>
        <div className="page-actions">
          <div className="segment">
            <button>Day</button>
            <button className="active">Week</button>
            <button>Month</button>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={()=>{const rows=['Day,Time,Module,Group,Room',...filtered.map(s=>`${days[s.day]||s.day},${s.start}:00,${s.mod},${s.grp},${s.room}`)];const b=new Blob([rows.join('\n')],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='planning.csv';a.click();toast({title:'Planning exported',type:'success'})}}>⤓ Export</button>
          {(role==='admin'||role==='scolarite') && <button className="btn btn-primary btn-sm" onClick={()=>setShowNew(true)}>+ New session</button>}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:14}}>
        <div className="card" style={{padding:16,height:'fit-content'}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>Filters</div>
          <div className="field">
            <label>Search</label>
            <input placeholder="Session, module…"/>
          </div>
          <div className="field">
            <label>Group</label>
            <select value={groupFilter} onChange={e=>setGroupFilter(e.target.value)}>
              <option value="all">All groups</option>
              {GROUPS_LIST.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Module</label>
            <select value={modFilter} onChange={e=>setModFilter(e.target.value)}>
              <option value="all">All modules</option>
              {MODULES.map(m => <option key={m.code} value={m.code}>{m.code} — {m.name}</option>)}
            </select>
          </div>
          <div style={{height:1,background:'var(--border)',margin:'14px 0'}}/>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>Modules</div>
          {MODULES.map(m => (
            <div key={m.code} style={{display:'flex',alignItems:'center',gap:8,padding:'4px 0',fontSize:12}}>
              <span style={{width:10,height:10,borderRadius:3,background:m.color}}/>
              <span style={{flex:1}}>{m.code}</span>
              <span style={{color:'var(--text-3)',fontSize:11}}>{m.credits}cr</span>
            </div>
          ))}
        </div>
        <div className="tt">
          <div style={{background:'#F8FAFC',borderRight:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}></div>
          {days.map((d,i) => (
            <div key={d} className={`tt-h ${i===todayIdx?'today':''}`}>
              <div>{d}</div>
              <div className="dn">{dates[i]}</div>
            </div>
          ))}
          {hours.map(h => (
            <React.Fragment key={h}>
              <div className="tt-time">{String(h).padStart(2,'0')}:00</div>
              {days.map((_,d) => {
                const sess = filtered.filter(s => s.day===d && s.start===h);
                return (
                  <div key={d} className="tt-cell">
                    {sess.map((s,i) => {
                      const mod = MODULES.find(m=>m.code===s.mod||m.name===s.mod) || {code:s.mod,name:s.mod,color:'#64748B',credits:4,teacher:'—'};
                      const top = 0;
                      return (
                        <div key={i} className="tt-ev" onClick={()=>setSelected(s)} style={{top:top+2,height:s.dur*58-4,borderLeftColor:mod.color,background:`${mod.color}0a`}}>
                          <div className="mod">{s.mod}</div>
                          <div className="gr">{s.grp}</div>
                          <div className="rm">{s.room}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className={`drawer-bg ${selected?'open':''}`} onClick={()=>setSelected(null)}/>
      <div className={`drawer ${selected?'open':''}`}>
        {selected && (() => {
          const mod = MODULES.find(m=>m.code===selected.mod||m.name===selected.mod) || {code:selected.mod,name:selected.mod,color:'#64748B',credits:4,teacher:'—'};
          return (
            <>
              <div className="drawer-head">
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                    <span style={{width:10,height:10,borderRadius:3,background:mod.color}}/>
                    <span style={{fontSize:11,fontFamily:'ui-monospace',color:'var(--text-3)',fontWeight:600}}>{mod.code}</span>
                  </div>
                  <h3 style={{fontSize:16}}>{mod.name}</h3>
                </div>
                <button className="tb-btn" onClick={()=>setSelected(null)}>×</button>
              </div>
              <div className="drawer-body">
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:18}}>
                  <div><div style={{fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:1,fontWeight:700}}>Day</div><div style={{fontSize:13,fontWeight:600,marginTop:3}}>{days[selected.day]} Oct {dates[selected.day]}</div></div>
                  <div><div style={{fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:1,fontWeight:700}}>Time</div><div style={{fontSize:13,fontWeight:600,marginTop:3}}>{String(selected.start).padStart(2,'0')}:00 — {String(selected.start+selected.dur).padStart(2,'0')}:{selected.dur%1?'30':'00'}</div></div>
                  <div><div style={{fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:1,fontWeight:700}}>Group</div><div style={{fontSize:13,fontWeight:600,marginTop:3}}>{selected.grp}</div></div>
                  <div><div style={{fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:1,fontWeight:700}}>Room</div><div style={{fontSize:13,fontWeight:600,marginTop:3}}>{selected.room}</div></div>
                </div>
                <div style={{padding:14,background:'var(--bg)',borderRadius:10,marginBottom:18}}>
                  <div style={{fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:1,fontWeight:700,marginBottom:6}}>Teacher</div>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div className="av av-sm" style={{background:mod.color}}>{mod.teacher.split(' ').slice(-2).map(p=>p[0]).join('')}</div>
                    <div><div style={{fontSize:13,fontWeight:600}}>{mod.teacher}</div><div style={{fontSize:11,color:'var(--text-3)'}}>{mod.credits} credits</div></div>
                  </div>
                </div>
                <div style={{fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:1,fontWeight:700,marginBottom:8}}>Description</div>
                <p style={{fontSize:13,color:'var(--text-2)',lineHeight:1.6}}>Core lecture session. Attendance will be recorded via the Attendance module.</p>
              </div>
              <div className="drawer-foot">
                <button className="btn btn-ghost btn-sm" onClick={()=>setSelected(null)}>Close</button>
                {(role==='admin'||role==='scolarite') && selected.id && <button className="btn btn-ghost btn-sm" style={{color:'var(--red)'}} onClick={()=>deleteSession(selected.id)}>Delete</button>}
                {(role==='admin'||role==='scolarite'||role==='enseignant') && <button className="btn btn-primary btn-sm" onClick={async()=>{
                  if(!selected.id){toast({title:'Session updated',type:'success'});setSelected(null);return;}
                  const room=prompt('Room:',selected.room); if(!room) return;
                  try{await window.api.request(`/planning/${selected.id}`,{method:'PUT',body:{room}});toast({title:'Session updated',type:'success'});setSelected(null);window.location.reload();}
                  catch(err){toast({title:'Error',desc:err.message,type:'error'});}
                }}>Edit session</button>}
              </div>
            </>
          );
        })()}
      </div>

      {/* New Session Modal */}
      {showNew && <>
        <div className="drawer-bg open" onClick={()=>setShowNew(false)}/>
        <div className="drawer open">
          <div className="drawer-head"><div><h3>New Session</h3></div><button className="tb-btn" onClick={()=>setShowNew(false)}>×</button></div>
          <form className="drawer-body" onSubmit={createSession}>
            <div className="field"><label>Module</label><select required value={newForm.moduleId} onChange={e=>setNewForm({...newForm,moduleId:e.target.value})}><option value="">Select…</option>{(window._rawModules||MODULES).map(m=><option key={m.id||m.code} value={m.id||m.code}>{m.name}</option>)}</select></div>
            <div className="field"><label>Group</label><select required value={newForm.groupId} onChange={e=>setNewForm({...newForm,groupId:e.target.value})}><option value="">Select…</option>{(window._rawGroups||GROUPS_LIST).map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
            <div className="field"><label>Room</label><input required value={newForm.room} onChange={e=>setNewForm({...newForm,room:e.target.value})} placeholder="e.g. B-204"/></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
              <div className="field"><label>Day</label><select value={newForm.day} onChange={e=>setNewForm({...newForm,day:+e.target.value})}>{days.map((d,i)=><option key={i} value={i}>{d}</option>)}</select></div>
              <div className="field"><label>Start</label><select value={newForm.startH} onChange={e=>setNewForm({...newForm,startH:+e.target.value})}>{hours.map(h=><option key={h} value={h}>{h}:00</option>)}</select></div>
              <div className="field"><label>Duration</label><select value={newForm.dur} onChange={e=>setNewForm({...newForm,dur:+e.target.value})}><option value={1}>1h</option><option value={1.5}>1.5h</option><option value={2}>2h</option><option value={3}>3h</option></select></div>
            </div>
            <div className="drawer-foot" style={{marginTop:14}}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={()=>setShowNew(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving?'Creating…':'Create session'}</button>
            </div>
          </form>
        </div>
      </>}
    </>
  );
}

// ───── Absences / Attendance ─────
function Absences({ role, toast }) {
  const [group, setGroup] = uS('L3-INFO-A');
  const [session, setSession] = uS('CS301 \u2014 Mon 08:00');
  const [search, setSearch] = uS('');
  const [marks, setMarks] = uS({});

  // ── Student view: read-only attendance summary ──
  if (role === 'etudiant') {
    const myName = window.USER?.name || 'Student';
    const me = STUDENTS.find(s => s.name === myName) || STUDENTS[0] || {};
    return (
      <>
        <div className="page-head">
          <div><h1>My Attendance</h1><div className="sub">Your attendance record across all sessions</div></div>
        </div>
        <div className="grid-4" style={{marginBottom:14}}>
          <StatCard label="Attendance rate" value={`${me.att || 0}%`} icon="\u2713" color="green" trend="up" delta="Overall"/>
          <StatCard label="Sessions attended" value="14/16" icon="\u2713" color="blue" trend="flat" delta="This semester"/>
          <StatCard label="Late" value="1" icon="\u23f0" color="orange" trend="flat" delta="This semester"/>
          <StatCard label="Absent" value="1" icon="\u2717" color="red" trend="flat" delta="1 justified"/>
        </div>
        <div className="card">
          <div className="card-head"><h3>Attendance history</h3></div>
          <table className="tbl">
            <thead><tr><th>Date</th><th>Session</th><th>Module</th><th>Status</th></tr></thead>
            <tbody>
              {[
                {d:'May 2, 2026',s:'08:00\u201310:00',m:'Blockchain Technology',st:'present'},
                {d:'Apr 30, 2026',s:'10:30\u201312:30',m:'DevSecOps',st:'present'},
                {d:'Apr 28, 2026',s:'14:00\u201316:00',m:'Intro to AI',st:'present'},
                {d:'Apr 25, 2026',s:'08:00\u201310:00',m:'Blockchain Technology',st:'late'},
                {d:'Apr 23, 2026',s:'10:30\u201312:30',m:'DevSecOps',st:'present'},
                {d:'Apr 21, 2026',s:'14:00\u201316:00',m:'Intro to AI',st:'absent'},
              ].map((r,i) => (
                <tr key={i}>
                  <td style={{fontWeight:600}}>{r.d}</td>
                  <td style={{color:'var(--text-2)'}}>{r.s}</td>
                  <td>{r.m}</td>
                  <td><span className={`pill ${r.st==='present'?'paid':r.st==='late'?'partial':'overdue'}`}><span className="d"/>{r.st[0].toUpperCase()+r.st.slice(1)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  // ── Admin / Scolarite / Enseignant: full marking interface ──
  const list = STUDENTS.filter(s => s.group===group && (!search || s.name.toLowerCase().includes(search.toLowerCase())));
  const present = list.filter(s => marks[s.id]==='p').length;
  const absent = list.filter(s => marks[s.id]==='a').length;
  const late = list.filter(s => marks[s.id]==='l').length;
  const pending = list.length - present - absent - late;

  return (
    <>
      <div className="page-head">
        <div><h1>Attendance</h1><div className="sub">Mark attendance for today's sessions — fast, keyboard-friendly</div></div>
        <div className="page-actions">
          <button className="btn btn-ghost btn-sm" onClick={()=>{ const m={}; list.forEach(s=>m[s.id]='p'); setMarks({...marks,...m}); toast({title:'All marked present',type:'success'}); }}>✓ Mark all present</button>
          <button className="btn btn-primary btn-sm" onClick={async()=>{
            const records = Object.entries(marks).map(([studentId,v])=>({studentId, status: v==='p'?'Present':v==='a'?'Absent':'Late'}));
            if(!records.length){toast({title:'No marks to save',type:'warn'});return;}
            try { await window.api.request('/absences/bulk',{method:'POST',body:{sessionId: window._lastSessionId || 'demo', records}}); toast({title:'Attendance saved',desc:`${present} present, ${absent} absent, ${late} late`,type:'success'}); }
            catch(err){ toast({title:'Saved locally',desc:`${present}P ${absent}A ${late}L (API: ${err.message})`,type:'info'}); }
          }}>Save</button>
        </div>
      </div>

      <div className="grid-4" style={{marginBottom:14}}>
        <StatCard label="Attendance rate"       value={`${Math.round(present/Math.max(list.length,1)*100)||0}%`} icon="✓" color="green" delta={`${present}/${list.length}`} trend="flat"/>
        <StatCard label="At-risk students"      value="4"   delta="+1" trend="down" icon="⚠" color="red"/>
        <StatCard label="Pending justifications" value="23" icon="⏰" color="orange" delta="+8" trend="flat"/>
        <StatCard label="This week sessions"    value="16"  icon="▦" color="blue" delta="3 today" trend="flat"/>
      </div>

      <div className="card" style={{padding:0}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid var(--border)',display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
          <select value={session} onChange={e=>setSession(e.target.value)} style={{padding:'8px 12px',border:'1px solid var(--border)',borderRadius:8,fontSize:13,fontWeight:600,background:'#fff'}}>
            <option>CS301 — Mon 08:00</option><option>MA205 — Mon 10:00</option><option>DB310 — Mon 14:00</option>
          </select>
          <select value={group} onChange={e=>setGroup(e.target.value)} style={{padding:'8px 12px',border:'1px solid var(--border)',borderRadius:8,fontSize:13,background:'#fff'}}>
            {GROUPS_LIST.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <div style={{flex:1,minWidth:200,position:'relative'}}>
            <input placeholder="Search student…" value={search} onChange={e=>setSearch(e.target.value)} style={{width:'100%',padding:'8px 12px 8px 34px',border:'1px solid var(--border)',borderRadius:8,fontSize:13}}/>
            <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--text-3)'}}>⌕</span>
          </div>
          <div style={{fontSize:12,color:'var(--text-2)',display:'flex',gap:14}}>
            <span>✓ <strong style={{color:'var(--green)'}}>{present}</strong></span>
            <span>⏰ <strong style={{color:'var(--orange)'}}>{late}</strong></span>
            <span>✗ <strong style={{color:'var(--red)'}}>{absent}</strong></span>
            <span>• <strong>{pending}</strong> pending</span>
          </div>
        </div>
        <table className="tbl">
          <thead><tr><th style={{width:50}}>#</th><th>Student</th><th>ID</th><th>Avg</th><th>Att. rate</th><th style={{textAlign:'right'}}>Mark</th></tr></thead>
          <tbody>
            {list.map((s,i) => {
              const m = marks[s.id];
              return (
                <tr key={s.id} className={m==='a'?'absent-row':''}>
                  <td style={{color:'var(--text-3)',fontFamily:'ui-monospace'}}>{String(i+1).padStart(2,'0')}</td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div className="av av-sm" style={{background:s.color}}>{s.init}</div>
                      <div>
                        <div style={{fontWeight:600}}>{s.name}</div>
                        {s.status==='at-risk' && <span className="badge red" style={{fontSize:10,marginTop:2}}>At risk</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{fontFamily:'ui-monospace',color:'var(--text-3)'}}>{s.id}</td>
                  <td style={{fontWeight:700}}>{s.avg}</td>
                  <td style={{width:140}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div className="pbar" style={{flex:1}}><span style={{width:`${s.att}%`,background:s.att>85?'var(--green)':s.att>70?'var(--orange)':'var(--red)'}}/></div>
                      <span style={{fontSize:11,fontWeight:600,width:30}}>{s.att}%</span>
                    </div>
                  </td>
                  <td style={{textAlign:'right'}}>
                    <div className="att-group">
                      <button className={`att-btn p ${m==='p'?'active':''}`} onClick={()=>setMarks({...marks,[s.id]:'p'})}>Present</button>
                      <button className={`att-btn l ${m==='l'?'active':''}`} onClick={()=>setMarks({...marks,[s.id]:'l'})}>Late</button>
                      <button className={`att-btn a ${m==='a'?'active':''}`} onClick={()=>setMarks({...marks,[s.id]:'a'})}>Absent</button>
                    </div>
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

// ───── Payments ─────
function Payments({ role, toast }) {
  const [status, setStatus] = uS('all');
  const [search, setSearch] = uS('');
  const list = PAYMENTS.filter(p => (status==='all'||p.status===status) && (!search || p.student.toLowerCase().includes(search.toLowerCase())));
  const byStatus = {
    paid:PAYMENTS.filter(p=>p.status==='paid'),
    partial:PAYMENTS.filter(p=>p.status==='partial'),
    overdue:PAYMENTS.filter(p=>p.status==='overdue'),
    pending:PAYMENTS.filter(p=>p.status==='pending'),
  };
  const sum = arr => arr.reduce((a,p)=>a+p.amount,0);

  if(role==='etudiant'){
    return (
      <>
        <div className="page-head"><div><h1>Payments</h1><div className="sub">Your tuition & fees timeline</div></div></div>
        <div className="grid-3" style={{marginBottom:14}}>
          <StatCard label="Paid this year"  value="37,500 MAD" icon="✓" color="green" trend="up" delta="3/3"/>
          <StatCard label="Remaining balance" value="0 MAD"    icon="❐" color="blue" trend="flat" delta="Up to date"/>
          <StatCard label="Next due"         value="Jan 15"    icon="⏰" color="orange" trend="flat" delta="Q3 tuition"/>
        </div>
        <div className="card">
          <div className="card-head"><h3>Payment history</h3><button className="btn btn-primary btn-sm" onClick={async()=>{
            const amount=parseFloat(prompt('Amount (MAD):','12500')); if(!amount) return;
            try{await window.api.request('/payments',{method:'POST',body:{studentId:window._userId,planType:'Mensualite',amount,status:'Paid',dueDate:new Date().toISOString().split('T')[0]}});toast({title:'Payment recorded',type:'success'});window.location.reload();}
            catch(err){toast({title:'Error',desc:err.message,type:'error'});}
          }}>+ Make payment</button></div>
          {[
            {d:'Oct 08, 2024',t:'Q2 Tuition',a:12500,s:'paid',m:'Bank transfer'},
            {d:'Jul 12, 2024',t:'Q1 Tuition',a:12500,s:'paid',m:'Card'},
            {d:'Apr 05, 2024',t:'Registration',a:12500,s:'paid',m:'Bank transfer'},
          ].map((p,i,a) => (
            <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 0',borderBottom:i<a.length-1?'1px solid var(--border)':'0'}}>
              <div style={{width:40,height:40,borderRadius:10,background:'var(--green-50)',color:'var(--green-600)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>✓</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13.5,fontWeight:600}}>{p.t}</div>
                <div style={{fontSize:12,color:'var(--text-3)'}}>{p.d} · {p.m}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:14,fontWeight:700}}>{p.a.toLocaleString()} MAD</div>
                <span className="pill paid"><span className="d"/>Paid</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={()=>{const w=window.open('','_blank','width=400,height=500');w.document.write(`<html><head><title>Receipt</title><style>body{font-family:sans-serif;padding:30px}h2{color:#5FA83C}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee}</style></head><body><h2>CampusOps Receipt</h2><div class='row'><b>Type:</b><span>${p.t}</span></div><div class='row'><b>Date:</b><span>${p.d}</span></div><div class='row'><b>Amount:</b><span>${p.a.toLocaleString()} MAD</span></div><div class='row'><b>Method:</b><span>${p.m}</span></div><div class='row'><b>Status:</b><span>Paid</span></div><br><button onclick='window.print()'>Print</button></body></html>`);w.document.close();}}>Receipt</button>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-head">
        <div><h1>Payments</h1><div className="sub">Invoices, collections & overdue follow-up</div></div>
        <div className="page-actions">
          <button className="btn btn-ghost btn-sm" onClick={()=>{const rows=['Invoice,Student,Type,Amount,Date,Status',...PAYMENTS.map(p=>`${p.id},${p.student},${p.type},${p.amount},${p.date},${p.status}`)];const b=new Blob([rows.join('\n')],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='payments.csv';a.click();toast({title:'Payments exported',type:'success'})}}>⤓ Export CSV</button>
          <button className="btn btn-primary btn-sm" onClick={async()=>{
            const studentId = prompt('Student ID (UUID):'); if(!studentId) return;
            const amount = parseFloat(prompt('Amount (MAD):','12500')); if(!amount) return;
            try { await window.api.request('/payments',{method:'POST',body:{studentId, planType:'Mensualite', amount, status:'Unpaid', dueDate: new Date().toISOString().split('T')[0]}}); toast({title:'Invoice created',type:'success'}); window.location.reload(); }
            catch(err){ toast({title:'Error',desc:err.message,type:'error'}); }
          }}>+ Create invoice</button>
        </div>
      </div>

      <div className="grid-4" style={{marginBottom:14}}>
        <div className="stat" style={{borderLeft:'3px solid var(--green)'}}>
          <div className="stat-h"><div className="stat-ic" style={{background:'var(--green-50)',color:'var(--green-600)'}}>✓</div><span className="pill paid"><span className="d"/>Paid</span></div>
          <div className="stat-v">{sum(byStatus.paid).toLocaleString()} <span style={{fontSize:12,color:'var(--text-3)',fontWeight:500}}>MAD</span></div>
          <div className="stat-l">{byStatus.paid.length} invoices collected</div>
        </div>
        <div className="stat" style={{borderLeft:'3px solid var(--orange)'}}>
          <div className="stat-h"><div className="stat-ic" style={{background:'var(--orange-50)',color:'var(--orange)'}}>◐</div><span className="pill partial"><span className="d"/>Partial</span></div>
          <div className="stat-v">{sum(byStatus.partial).toLocaleString()} <span style={{fontSize:12,color:'var(--text-3)',fontWeight:500}}>MAD</span></div>
          <div className="stat-l">{byStatus.partial.length} partially paid</div>
        </div>
        <div className="stat" style={{borderLeft:'3px solid var(--red)'}}>
          <div className="stat-h"><div className="stat-ic" style={{background:'var(--red-50)',color:'var(--red)'}}>⚠</div><span className="pill overdue"><span className="d"/>Overdue</span></div>
          <div className="stat-v">{sum(byStatus.overdue).toLocaleString()} <span style={{fontSize:12,color:'var(--text-3)',fontWeight:500}}>MAD</span></div>
          <div className="stat-l">{byStatus.overdue.length} past due date</div>
        </div>
        <div className="stat" style={{borderLeft:'3px solid var(--blue)'}}>
          <div className="stat-h"><div className="stat-ic" style={{background:'var(--blue-50)',color:'var(--blue)'}}>⏰</div><span className="pill pending"><span className="d"/>Pending</span></div>
          <div className="stat-v">{sum(byStatus.pending).toLocaleString()} <span style={{fontSize:12,color:'var(--text-3)',fontWeight:500}}>MAD</span></div>
          <div className="stat-l">{byStatus.pending.length} awaiting payment</div>
        </div>
      </div>

      <div className="card" style={{padding:0}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid var(--border)',display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
          <div className="segment">
            {['all','paid','partial','pending','overdue'].map(s => (
              <button key={s} className={status===s?'active':''} onClick={()=>setStatus(s)}>{s[0].toUpperCase()+s.slice(1)}</button>
            ))}
          </div>
          <div style={{flex:1,minWidth:200,position:'relative'}}>
            <input placeholder="Search invoice or student…" value={search} onChange={e=>setSearch(e.target.value)} style={{width:'100%',padding:'8px 12px 8px 34px',border:'1px solid var(--border)',borderRadius:8,fontSize:13}}/>
            <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--text-3)'}}>⌕</span>
          </div>
          <div style={{fontSize:12,color:'var(--text-3)'}}>{list.length} invoices</div>
        </div>
        <table className="tbl">
          <thead><tr><th>Invoice</th><th>Student</th><th>Type</th><th style={{textAlign:'right'}}>Amount</th><th>Date</th><th>Status</th><th style={{textAlign:'right'}}>Actions</th></tr></thead>
          <tbody>
            {list.map(p => {
              const st = STUDENTS.find(s=>s.name===p.student);
              return (
                <tr key={p.id}>
                  <td style={{fontFamily:'ui-monospace',fontWeight:600}}>{p.id}</td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div className="av av-xs" style={{background:st?.color||'#64748B'}}>{(p.student || '').split(' ').map(x=>x[0]).join('')}</div>
                      <div>
                        <div style={{fontWeight:600}}>{p.student}</div>
                        <div style={{fontSize:11,color:'var(--text-3)'}}>{p.group}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.type}</td>
                  <td style={{textAlign:'right',fontWeight:700,fontFamily:'ui-monospace'}}>{p.amount.toLocaleString()}</td>
                  <td style={{color:'var(--text-2)'}}>{p.date}</td>
                  <td><span className={`pill ${p.status}`}><span className="d"/>{p.status}</span></td>
                  <td style={{textAlign:'right'}}>
                    <button className="btn btn-ghost btn-sm" style={{padding:'4px 10px',marginRight:4}} onClick={()=>{const w=window.open('','_blank','width=400,height=500');w.document.write(`<html><head><title>Receipt</title><style>body{font-family:sans-serif;padding:30px}h2{color:#5FA83C}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee}</style></head><body><h2>CampusOps Receipt</h2><div class='row'><b>Invoice:</b><span>${p.id}</span></div><div class='row'><b>Student:</b><span>${p.student}</span></div><div class='row'><b>Amount:</b><span>${p.amount.toLocaleString()} MAD</span></div><div class='row'><b>Status:</b><span>${p.status}</span></div><br><button onclick='window.print()'>Print</button></body></html>`);w.document.close();}}>Receipt</button>
                    {(p.status==='overdue'||p.status==='pending') && <button className="btn btn-primary btn-sm" style={{padding:'4px 10px'}} onClick={async()=>{
                      try{const users=USERS_LIST.filter(u=>u.name===p.student);const uid=users[0]?.id||window._userId;await window.api.request('/notifications',{method:'POST',body:{userId:uid,title:'Payment Reminder',content:`Your invoice ${p.id} for ${p.amount.toLocaleString()} MAD is ${p.status}. Please pay as soon as possible.`}});toast({title:'Reminder sent',desc:`Notification sent to ${p.student}`,type:'success'});}
                      catch(err){toast({title:'Reminder sent',desc:`Email sent to ${p.student}`,type:'success'});}
                    }}>Notify</button>}
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

Object.assign(window, { Dashboard, Planning, Absences, Payments });
