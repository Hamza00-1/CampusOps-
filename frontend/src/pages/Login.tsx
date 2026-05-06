import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@campusops.ma');
  const [pwd, setPwd] = useState('Admin123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await login(email, pwd); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="login">
      <div className="login-hero">
        <div className="logo">
          <div className="logo-mark">
            <svg viewBox="0 0 40 40" width="40" height="40">
              <defs><linearGradient id="ue-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7CB342"/><stop offset="1" stopColor="#558B2F"/></linearGradient></defs>
              <path d="M8 6 L8 22 Q8 32 20 32 Q32 32 32 22 L32 6 L26 6 L26 22 Q26 26 20 26 Q14 26 14 22 L14 6 Z" fill="url(#ue-g)"/>
              <circle cx="20" cy="16" r="2.5" fill="#fff"/>
            </svg>
          </div>
          <div>
            <div className="logo-txt">UEMF CampusOps</div>
            <div style={{ fontSize: 10.5, opacity: .85, letterSpacing: 1.8, textTransform: 'uppercase', marginTop: 2, fontWeight: 500 }}>EIDIA · Academic Platform</div>
          </div>
        </div>
        <div className="hero-body">
          <h1>Where academic operations come together.</h1>
          <p className="lead">Planning, attendance, progress and payments — unified in a single, secure workspace for the EIDIA school at Université Euro-Méditerranéenne de Fès.</p>
          <div className="badges">
            <span className="hbadge">🔒 JWT Protected</span>
            <span className="hbadge">🌐 5 Fields</span>
            <span className="hbadge">⚡ Role-based access</span>
          </div>
        </div>
        <div className="foot">
          <span>© 2025 CampusOps Platform</span>
          <span>EIDIA · UEMF</span>
        </div>
      </div>

      <div className="login-form-wrap">
        <form className="login-form" onSubmit={submit}>
          <h2>Sign in to your workspace</h2>
          <div className="sub">Use your campus credentials to continue.</div>

          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8, letterSpacing: 0.3, textTransform: 'uppercase' }}>Quick demo accounts</div>
          <div className="role-tabs">
            {[
              { l: 'Admin', e: 'admin@campusops.ma', p: 'Admin123!' },
              { l: 'Scolarité', e: 'scolarite@campusops.ma', p: 'Scolar123!' },
              { l: 'Prof', e: 'prof@campusops.ma', p: 'Prof123!' },
              { l: 'Student', e: 'student@campusops.ma', p: 'Student123!' },
            ].map(r => (
              <button type="button" key={r.l} className={`role-tab ${email === r.e ? 'active' : ''}`}
                onClick={() => { setEmail(r.e); setPwd(r.p); }}>{r.l}</button>
            ))}
          </div>

          {error && <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--red-50)', color: 'var(--red)', fontSize: 12, marginBottom: 14, border: '1px solid #FECACA' }}>⚠ {error}</div>}

          <div className="field">
            <label>Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} />
          </div>
          <button className="btn btn-primary full" type="submit" disabled={loading} style={{ marginTop: 12 }}>
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
          <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.6 }}>
            Access is restricted to enrolled members.<br />Backend running at <strong>localhost:3000</strong>
          </div>
        </form>
      </div>
    </div>
  );
}
