import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Planning from './pages/Planning';
import Absences from './pages/Absences';
import Modules from './pages/Modules';
import Progress from './pages/Progress';
import Payments from './pages/Payments';
import Users from './pages/Users';
import Groups from './pages/Groups';
import Branches from './pages/Branches';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard', planning: 'Planning', absences: 'Attendance',
  modules: 'Modules', progress: 'Progress', payments: 'Payments',
  users: 'Users', groups: 'Groups', branches: 'Branches',
  notifications: 'Notifications', settings: 'Settings',
};

function Shell() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState(() => localStorage.getItem('co_page') || 'dashboard');
  const [collapsed, setColl] = useState(() => localStorage.getItem('co_coll') === '1');

  useEffect(() => { localStorage.setItem('co_page', page); }, [page]);
  useEffect(() => { localStorage.setItem('co_coll', collapsed ? '1' : '0'); }, [collapsed]);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin .6s linear infinite', margin: '0 auto 16px' }} />
        <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Loading CampusOps…</div>
      </div>
    </div>
  );

  if (!user) return <Login />;

  return (
    <div className={`app ${collapsed ? 'collapsed' : ''}`}>
      <Sidebar active={page} onNav={setPage} collapsed={collapsed} onToggle={() => setColl(!collapsed)} />
      <div className="main">
        <Topbar pageTitle={PAGE_TITLES[page] || 'Dashboard'} onNav={setPage} />
        <main className="content">
          {page === 'dashboard' && <Dashboard />}
          {page === 'planning' && <Planning />}
          {page === 'absences' && <Absences />}
          {page === 'modules' && <Modules />}
          {page === 'progress' && <Progress />}
          {page === 'payments' && <Payments />}
          {page === 'users' && <Users />}
          {page === 'groups' && <Groups />}
          {page === 'branches' && <Branches />}
          {page === 'notifications' && <Notifications />}
          {page === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
