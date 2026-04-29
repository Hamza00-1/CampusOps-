/* global React, ReactDOM */
const { useState: useStateApp, useEffect: useEffectApp } = React;

function App() {
  const [role, setRole] = useStateApp(() => localStorage.getItem('co_role') || null);
  const [page, setPage] = useStateApp(() => localStorage.getItem('co_page') || 'dashboard');

  useEffectApp(() => { if (role) localStorage.setItem('co_role', role); }, [role]);
  useEffectApp(() => { localStorage.setItem('co_page', page); }, [page]);

  if (!role) return <window.Login onLogin={(r) => setRole(r)} />;

  const unread = window.CO_DATA.notifications.filter(n=>n.unread).length;

  const PageComp = {
    dashboard: window.DashboardPage,
    planning: window.PlanningPage,
    attendance: window.AttendancePage,
    progress: window.ProgressPage,
    payments: window.PaymentsPage,
    students: window.StudentsPage,
    notifications: window.NotificationsPage,
    settings: window.SettingsPage,
  }[page] || window.DashboardPage;

  return (
    <div className="app">
      <window.Sidebar page={page} setPage={setPage} role={role} unread={unread} />
      <div className="main">
        <window.Topbar page={page} role={role} setRole={setRole}
                       onLogout={()=>{ localStorage.removeItem('co_role'); setRole(null); }}
                       unread={unread} />
        <div className="content">
          <PageComp role={role} />
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
