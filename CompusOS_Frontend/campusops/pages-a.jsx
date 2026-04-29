/* global React */
const { useState: useStateP, useMemo: useMemoP, useEffect: useEffectP } = React;
const DP = window.CO_DATA;

// ─── tiny helpers ───
const cn = (...a) => a.filter(Boolean).join(' ');
const roleColor = (r) => DP.roles.find(x=>x.key===r)?.color || '#3b82f6';

// ──────────────────────────── DASHBOARD ────────────────────────────
function DashboardPage({ role }) {
  const stats = {
    admin: [
      { i:'👥', l:'Total Students', v:'1,247', t:'+42 this month', trend:'up', c:'#3b82f6' },
      { i:'✅', l:'Attendance Rate', v:'96%', t:'+1.2% vs last week', trend:'up', c:'#10b981' },
      { i:'💳', l:'Pending Payments', v:'23', t:'−8 this week', trend:'up', c:'#f59e0b' },
      { i:'📊', l:'Avg. Progress', v:'74%', t:'+5% this month', trend:'up', c:'#06b6d4' },
    ],
    scolarite: [
      { i:'📝', l:'Active Enrollments', v:'1,247', t:'up to date', trend:'flat', c:'#3b82f6' },
      { i:'📅', l:'Classes Today', v:'18', t:'3 rescheduled', trend:'flat', c:'#06b6d4' },
      { i:'⚠️', l:'Overdue Payments', v:'12', t:'+2 today', trend:'down', c:'#ef4444' },
      { i:'📬', l:'Unread Requests', v:'7', t:'2 urgent', trend:'flat', c:'#f59e0b' },
    ],
    enseignant: [
      { i:'📚', l:'My Modules', v:'3', t:'CS401 · CS402 · CS405', trend:'flat', c:'#3b82f6' },
      { i:'👥', l:'My Students', v:'82', t:'across 4 groups', trend:'flat', c:'#06b6d4' },
      { i:'✓', l:'Avg Attendance', v:'91%', t:'+0.8% this week', trend:'up', c:'#10b981' },
      { i:'📊', l:'Avg Progress', v:'62%', t:'on schedule', trend:'up', c:'#f59e0b' },
    ],
    etudiant: [
      { i:'📅', l:'Classes Today', v:'3', t:'next at 14:00', trend:'flat', c:'#3b82f6' },
      { i:'✓', l:'My Attendance', v:'94%', t:'2 absences total', trend:'up', c:'#10b981' },
      { i:'📈', l:'Avg Progress', v:'76%', t:'above class avg', trend:'up', c:'#06b6d4' },
      { i:'💳', l:'Next Payment', v:'25 Apr', t:'5,500 MAD due', trend:'flat', c:'#f59e0b' },
    ],
  }[role];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>👋 Welcome back, {DP.roles.find(r=>r.key===role)?.name}</h1>
          <div className="sub">Here's what's happening at UEMF today — Wed, Apr 22, 2026.</div>
        </div>
        <div className="page-head-actions">
          <button className="btn btn-ghost btn-sm">Export</button>
          <button className="btn btn-primary btn-sm" style={{width:'auto'}}>+ New</button>
        </div>
      </div>

      <div className="grid-4" style={{marginBottom:16}}>
        {stats.map((s,i) => (
          <div key={i} className="stat" style={{'--accent-color': s.c}}>
            <div className="h">
              <div className="ic" style={{background: s.c+'22', color: s.c}}>{s.i}</div>
              <span className={cn('trend', s.trend)}>{s.trend==='up'?'▲':s.trend==='down'?'▼':'•'} {s.t}</span>
            </div>
            <div className="v">{s.v}</div>
            <div className="l">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="grid-2-3" style={{marginBottom:16}}>
        <div className="card">
          <div className="card-head">
            <h3>Weekly Attendance</h3>
            <span className="meta">Apr 14 – Apr 20</span>
          </div>
          <BarChart />
        </div>
        <div className="card">
          <div className="card-head">
            <h3>Module Progress</h3>
            <span className="meta">This semester</span>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {DP.modules.slice(0,5).map(m => (
              <div key={m.id}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                  <div style={{fontSize:12,fontWeight:600}}>{m.code} · {m.name}</div>
                  <div style={{fontSize:12,color:'var(--text-2)'}}>{m.progress}%</div>
                </div>
                <div className="pbar"><span style={{width:m.progress+'%',background:m.color}}/></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head">
            <h3>Today's Schedule</h3>
            <span className="meta">Wed, Apr 22</span>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {DP.planning.filter(p=>p.day===2).map((p,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'80px 1fr auto',gap:12,alignItems:'center',
                                   padding:'10px 14px',background:'var(--bg-card-2)',
                                   borderLeft:`3px solid ${p.color}`,borderRadius:8}}>
                <div className="mono" style={{fontSize:11,color:'var(--text-2)',fontWeight:600}}>{String(p.start).padStart(2,'0')}:00–{String(p.end).padStart(2,'0')}:00</div>
                <div>
                  <div style={{fontSize:13,fontWeight:700}}>{p.module}</div>
                  <div style={{fontSize:11,color:'var(--text-3)'}}>{p.group} · {p.teacher}</div>
                </div>
                <span className="chip gray">{p.room}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Recent Activity</h3>
            <span className="meta">Live</span>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {DP.notifications.slice(0,5).map(n=>(
              <div key={n.id} className={cn('notif-item', n.unread && 'unread')}>
                <div className="icn" style={{background:'rgba(26,86,219,0.12)'}}>{n.icon}</div>
                <div style={{flex:1}}>
                  <div className="title">{n.title}</div>
                  <div className="desc">{n.desc}</div>
                  <div className="time">{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function BarChart() {
  const data = [ {d:'Mon',v:94}, {d:'Tue',v:91}, {d:'Wed',v:96}, {d:'Thu',v:88}, {d:'Fri',v:92}, {d:'Sat',v:85} ];
  const max = 100;
  return (
    <div className="chart-wrap" style={{display:'flex',alignItems:'flex-end',gap:12,padding:'0 10px'}}>
      {data.map((b,i)=>{
        const h = (b.v/max)*180;
        const c = i===2 ? '#06b6d4' : '#3b82f6';
        return (
          <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
            <div style={{fontSize:10,color:'var(--text-3)',fontWeight:600}}>{b.v}%</div>
            <div style={{width:'100%',height:h,background:`linear-gradient(180deg, ${c}, ${c}66)`,
                         borderRadius:'6px 6px 0 0',transition:'height 0.6s ease'}}/>
            <div style={{fontSize:11,color:'var(--text-2)',fontWeight:600}}>{b.d}</div>
          </div>
        );
      })}
    </div>
  );
}

// ──────────────────────────── PLANNING ────────────────────────────
function PlanningPage({ role }) {
  const [view, setView] = useState('week');
  const day = 2; // Wed
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Planning</h1>
          <div className="sub">Week of April 20–25, 2026</div>
        </div>
        <div className="page-head-actions">
          <button className={cn('btn btn-sm', view==='day'?'btn-primary':'btn-ghost')} onClick={()=>setView('day')} style={{width:'auto'}}>Day</button>
          <button className={cn('btn btn-sm', view==='week'?'btn-primary':'btn-ghost')} onClick={()=>setView('week')} style={{width:'auto'}}>Week</button>
          {(role==='admin'||role==='scolarite') && <button className="btn btn-primary btn-sm" style={{width:'auto'}}>+ New Event</button>}
        </div>
      </div>
      <div className="card">
        <div className="tt-wrap">
          <div className="tt-grid">
            <div className="tt-head">TIME</div>
            {DP.days.map(d => <div key={d} className="tt-head">{d}</div>)}
            {DP.hours.map(h => (
              <React.Fragment key={h}>
                <div className="tt-time">{String(h).padStart(2,'0')}:00</div>
                {DP.days.map((_,di)=>{
                  const evt = DP.planning.find(p => p.day===di && p.start===h);
                  return (
                    <div key={di} className="tt-cell">
                      {evt && (
                        <div className="tt-event"
                             style={{
                               borderLeftColor: evt.color,
                               background: evt.color+'18',
                               height: (evt.end-evt.start)*56 - 10,
                             }}>
                          <div className="mod">{evt.module}</div>
                          <div className="gr">{evt.group}</div>
                          <div className="rm">{evt.room} · {evt.teacher}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ──────────────────────────── ATTENDANCE ────────────────────────────
function AttendancePage({ role }) {
  const [session, setSession] = useState('CS401 · GI-4-A · Wed 08:00');
  const [att, setAtt] = useState(() =>
    Object.fromEntries(DP.students.slice(0,8).map(s => [s.id, 'present']))
  );
  const counts = useMemo(()=>{
    const c={present:0,late:0,absent:0};
    Object.values(att).forEach(v=>c[v]++);
    return c;
  },[att]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Attendance</h1>
          <div className="sub">Mark attendance for today's session.</div>
        </div>
        <div className="page-head-actions">
          <button className="btn btn-ghost btn-sm" style={{width:'auto'}}>View stats</button>
          <button className="btn btn-primary btn-sm" style={{width:'auto'}}>Save ({Object.keys(att).length})</button>
        </div>
      </div>

      <div className="grid-4" style={{marginBottom:14}}>
        <div className="stat" style={{'--accent-color':'#3b82f6'}}>
          <div className="h"><div className="ic" style={{background:'rgba(59,130,246,0.15)',color:'#3b82f6'}}>📚</div></div>
          <div className="v" style={{fontSize:18}}>{session}</div><div className="l">Current session</div>
        </div>
        <div className="stat" style={{'--accent-color':'#10b981'}}>
          <div className="h"><div className="ic" style={{background:'rgba(16,185,129,0.15)',color:'#10b981'}}>✓</div></div>
          <div className="v">{counts.present}</div><div className="l">Present</div>
        </div>
        <div className="stat" style={{'--accent-color':'#f59e0b'}}>
          <div className="h"><div className="ic" style={{background:'rgba(245,158,11,0.15)',color:'#f59e0b'}}>⏱</div></div>
          <div className="v">{counts.late}</div><div className="l">Late</div>
        </div>
        <div className="stat" style={{'--accent-color':'#ef4444'}}>
          <div className="h"><div className="ic" style={{background:'rgba(239,68,68,0.15)',color:'#ef4444'}}>✕</div></div>
          <div className="v">{counts.absent}</div><div className="l">Absent</div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h3>Roster — {DP.students.slice(0,8).length} students</h3><span className="meta">Click to mark</span></div>
        {DP.students.slice(0,8).map(s => (
          <div key={s.id} className="roster-row">
            <div className="avatar-xs" style={{background:`linear-gradient(135deg,#${Math.floor(Math.random()*16777215).toString(16).padStart(6,'a')},#06b6d4)`,color:'white'}}>
              {s.name.split(' ').map(x=>x[0]).slice(0,2).join('')}
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:600}}>{s.name}</div>
              <div style={{fontSize:11,color:'var(--text-3)'}}>{s.group} · Attendance {s.attendance}%</div>
            </div>
            <span className="chip gray">{s.email.split('@')[0]}</span>
            <div className="att-toggle">
              {['present','late','absent'].map(st => (
                <button key={st}
                        className={cn('att-btn', att[s.id]===st && 'active', st)}
                        onClick={()=>setAtt({...att,[s.id]:st})}>
                  {st==='present'?'✓ Present':st==='late'?'⏱ Late':'✕ Absent'}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ──────────────────────────── PROGRESS ────────────────────────────
function ProgressPage({ role }) {
  return (
    <>
      <div className="page-head">
        <div><h1>Academic Progress</h1><div className="sub">Module completion % across active groups.</div></div>
        <div className="page-head-actions">
          <button className="btn btn-ghost btn-sm" style={{width:'auto'}}>Export CSV</button>
        </div>
      </div>
      <div className="grid-3" style={{marginBottom:14}}>
        {DP.modules.map(m => (
          <div key={m.id} className="card" style={{padding:18}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <div>
                <div style={{fontSize:11,color:'var(--text-3)',fontFamily:'monospace',fontWeight:600}}>{m.code}</div>
                <div style={{fontSize:14,fontWeight:700,marginTop:2}}>{m.name}</div>
              </div>
              <Ring pct={m.progress} color={m.color} />
            </div>
            <div style={{fontSize:11,color:'var(--text-2)',marginBottom:8}}>{m.teacher} · {m.branch}</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              <span className="chip gray">{m.progress >= 80 ? '🎯 Ahead' : m.progress >= 60 ? '✓ On track' : '⚠ Behind'}</span>
              <span className="chip blue">Week 10/14</span>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-head"><h3>Progress Timeline</h3><span className="meta">Since January</span></div>
        <TimelineChart />
      </div>
    </>
  );
}

function Ring({ pct, color }) {
  const r = 22, c = 2*Math.PI*r;
  return (
    <div className="ring">
      <svg viewBox="0 0 54 54">
        <circle cx="27" cy="27" r={r} fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="5"/>
        <circle cx="27" cy="27" r={r} fill="none" stroke={color} strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={c} strokeDashoffset={c - (pct/100)*c}/>
      </svg>
      <div className="v" style={{color}}>{pct}%</div>
    </div>
  );
}

function TimelineChart() {
  const weeks = Array.from({length:14},(_,i)=>i+1);
  return (
    <div style={{position:'relative',height:180}}>
      <svg viewBox="0 0 800 180" width="100%" height="100%" preserveAspectRatio="none">
        {[0,25,50,75,100].map(y => (
          <line key={y} x1="0" x2="800" y1={180-y*1.6} y2={180-y*1.6} stroke="rgba(148,163,184,0.08)" strokeWidth="1"/>
        ))}
        {DP.modules.slice(0,4).map((m,i) => {
          const pts = weeks.map(w => [w/14*800, 180 - (w*m.progress/14)*1.6 + (Math.sin(w+i)*6)]);
          const path = pts.map((p,j)=> (j===0?'M':'L')+p[0]+' '+p[1]).join(' ');
          return <path key={m.id} d={path} fill="none" stroke={m.color} strokeWidth="2.5" strokeLinecap="round"/>;
        })}
      </svg>
      <div className="chart-legend" style={{position:'absolute',top:8,right:12}}>
        {DP.modules.slice(0,4).map(m => (
          <span key={m.id}><span className="sw" style={{background:m.color}}/>{m.code}</span>
        ))}
      </div>
    </div>
  );
}

window.DashboardPage = DashboardPage;
window.PlanningPage = PlanningPage;
window.AttendancePage = AttendancePage;
window.ProgressPage = ProgressPage;
