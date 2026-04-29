// CampusOps — App root
const { useState: uSA, useEffect: uEA } = React;

const PAGE_TITLES = {
  dashboard:'Dashboard', planning:'Planning', absences:'Attendance', modules:'Modules',
  progress:'Progress', payments:'Payments', users:'Users', groups:'Groups',
  branches:'Branches', notifications:'Notifications', settings:'Settings',
};

function App() {
  const [auth, setAuth]       = uSA(() => localStorage.getItem('co2_role') || null);
  const [page, setPage]       = uSA(() => localStorage.getItem('co2_page') || 'dashboard');
  const [collapsed, setColl]  = uSA(() => localStorage.getItem('co2_coll')==='1');
  const [toasts, setToasts]   = uSA([]);
  const [notifOpen, setNo]    = uSA(false);
  const [profOpen, setPo]     = uSA(false);

  uEA(() => { if(auth) localStorage.setItem('co2_role', auth); else localStorage.removeItem('co2_role'); }, [auth]);
  uEA(() => localStorage.setItem('co2_page', page), [page]);
  uEA(() => localStorage.setItem('co2_coll', collapsed?'1':'0'), [collapsed]);

  const toast = (t) => {
    const id = Math.random().toString(36).slice(2,9);
    setToasts(ts => [...ts, {id, type:'info', ...t}]);
    setTimeout(() => setToasts(ts => ts.filter(x => x.id!==id)), 3800);
  };
  const removeT = (id) => setToasts(ts => ts.filter(x => x.id!==id));

  const navigate = (p) => {
    if(p==='payments' && auth==='enseignant') return;
    setPage(p); setNo(false); setPo(false);
  };

  if(!auth) return <Login onAuth={(r)=>{ setAuth(r); setPage('dashboard'); setTimeout(()=>toast({title:'Welcome back',desc:ROLES[r].name,type:'success'}),300); }} />;

  const unread = NOTIFICATIONS.filter(n=>!n.read).length;
  const pageTitle = PAGE_TITLES[page] || 'Dashboard';

  return (
    <div className={`app ${collapsed?'collapsed':''}`}>
      <Sidebar role={auth} active={page} onNav={navigate} collapsed={collapsed} onToggle={()=>setColl(!collapsed)} />
      <div className="main">
        <Topbar role={auth}
          onRole={(r)=>{ setAuth(r); toast({title:`Switched to ${ROLES[r].label}`,type:'success'}); }}
          onLogout={()=>{ setAuth(null); setPage('dashboard'); }}
          onNav={navigate}
          unread={unread}
          notifOpen={notifOpen} setNotifOpen={setNo}
          profOpen={profOpen}   setProfOpen={setPo}
          pageTitle={pageTitle}
        />
        <main className="content">
          {page==='dashboard'     && <Dashboard role={auth} toast={toast} onNav={navigate} />}
          {page==='planning'      && <Planning role={auth} toast={toast} />}
          {page==='absences'      && <Absences role={auth} toast={toast} />}
          {page==='modules'       && <Modules role={auth} toast={toast} />}
          {page==='progress'      && <Progress role={auth} />}
          {page==='payments'      && <Payments role={auth} toast={toast} />}
          {page==='users'         && <Users toast={toast} />}
          {page==='groups'        && <Groups toast={toast} />}
          {page==='branches'      && <Branches toast={toast} />}
          {page==='notifications' && <Notifications toast={toast} />}
          {page==='settings'      && <Settings role={auth} onLogout={()=>{ setAuth(null); setPage('dashboard'); }} />}
        </main>
      </div>
      <Toasts items={toasts} remove={removeT} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
