import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Props { pageTitle: string; onNav: (p: string) => void; }

const ROLE_COLORS: Record<string, string> = {
  Admin: '#5FA83C', Scolarite: '#7C3AED', Enseignant: '#7CB342', Etudiant: '#F59E0B',
};

export default function Topbar({ pageTitle, onNav }: Props) {
  const { user, logout } = useAuth();
  const [profOpen, setPo] = useState(false);
  const pRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (pRef.current && !pRef.current.contains(e.target as Node)) setPo(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  if (!user) return null;
  const initials = user.name.split(' ').map(p => p[0]).slice(0, 2).join('');

  return (
    <header className="tb">
      <div className="tb-search">
        <input placeholder={`Search ${pageTitle.toLowerCase()}…`} />
        <span className="tb-kbd">⌘K</span>
      </div>
      <div className="tb-sp" />
      <button className="tb-btn" onClick={() => onNav('notifications')} title="Notifications">◐</button>
      <button className="tb-btn" title="Help">?</button>
      <div ref={pRef} style={{ position: 'relative' }}>
        <div className="tb-role" onClick={() => setPo(!profOpen)}>
          <span className="d" style={{ width: 8, height: 8, borderRadius: '50%', background: ROLE_COLORS[user.role], display: 'inline-block' }} />
          <span>{user.role}</span>
          <span style={{ opacity: .5 }}>▾</span>
        </div>
        {profOpen && (
          <div className="menu">
            <div style={{ padding: '10px 10px', borderBottom: '1px solid var(--border)', marginBottom: 6, display: 'flex', gap: 10, alignItems: 'center' }}>
              <div className="av av-sm" style={{ background: ROLE_COLORS[user.role] }}>{initials}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{user.email}</div>
              </div>
            </div>
            <div className="menu-item" onClick={() => { onNav('settings'); setPo(false); }}>⚙ Settings</div>
            <div className="menu-item" onClick={() => { logout(); setPo(false); }} style={{ color: 'var(--red)' }}>⎋ Sign out</div>
          </div>
        )}
      </div>
    </header>
  );
}
