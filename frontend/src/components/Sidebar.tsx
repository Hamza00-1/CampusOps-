import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

interface Props {
  active: string;
  onNav: (p: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const NAV_GROUPS: { label: string; items: { id: string; label: string; icon: string; roles: Role[] }[] }[] = [
  { label: 'Academic', items: [
    { id: 'dashboard',  label: 'Dashboard',  icon: '◈', roles: ['Admin','Scolarite','Enseignant','Etudiant'] },
    { id: 'planning',   label: 'Planning',   icon: '▦', roles: ['Admin','Scolarite','Enseignant','Etudiant'] },
    { id: 'absences',   label: 'Attendance',  icon: '✓', roles: ['Admin','Scolarite','Enseignant','Etudiant'] },
    { id: 'modules',    label: 'Modules',    icon: '≡', roles: ['Admin','Scolarite','Enseignant','Etudiant'] },
  ]},
  { label: 'Personal', items: [
    { id: 'progress',   label: 'Progress',   icon: '◴', roles: ['Admin','Scolarite','Enseignant','Etudiant'] },
    { id: 'payments',   label: 'Payments',   icon: '❐', roles: ['Admin','Scolarite','Etudiant'] },
  ]},
  { label: 'Administration', items: [
    { id: 'users',          label: 'Users',         icon: '◍', roles: ['Admin'] },
    { id: 'groups',         label: 'Groups',        icon: '◎', roles: ['Admin','Scolarite'] },
    { id: 'branches',       label: 'Branches',      icon: '⬡', roles: ['Admin'] },
    { id: 'notifications',  label: 'Notifications', icon: '◐', roles: ['Admin','Scolarite','Enseignant','Etudiant'] },
  ]},
];

const ROLE_COLORS: Record<Role, string> = {
  Admin: '#5FA83C', Scolarite: '#7C3AED', Enseignant: '#7CB342', Etudiant: '#F59E0B',
};

export default function Sidebar({ active, onNav, collapsed, onToggle }: Props) {
  const { user } = useAuth();
  if (!user) return null;
  const initials = user.name.split(' ').map(p => p[0]).slice(0, 2).join('');

  return (
    <aside className="sb">
      <div className="sb-head">
        <div className="sb-logo">C</div>
        {!collapsed && <div className="sb-brand">CampusOps<small>EIDIA · UEMF</small></div>}
        <button className="sb-toggle" onClick={onToggle} title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? '›' : '‹'}
        </button>
      </div>
      <div className="sb-body">
        {NAV_GROUPS.map(g => {
          const items = g.items.filter(i => i.roles.includes(user.role));
          if (!items.length) return null;
          return (
            <div className="sb-group" key={g.label}>
              <div className="sb-group-label">{g.label}</div>
              {items.map(i => (
                <div key={i.id} className={`sb-item ${active === i.id ? 'active' : ''}`} onClick={() => onNav(i.id)}>
                  <span className="ic">{i.icon}</span>
                  <span className="lbl">{i.label}</span>
                  <span className="tip">{i.label}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <div className="sb-foot">
        <div className="sb-user" title={user.name}>
          <div className="av" style={{ background: ROLE_COLORS[user.role] }}>{initials}</div>
          <div className="info">
            <div className="nm">{user.name}</div>
            <div className="rl">{user.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
