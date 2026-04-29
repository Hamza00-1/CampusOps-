/* global React */
const { useState, useMemo } = React;
const D2 = window.CO_DATA;

// ──────────────────────────── LOGIN ────────────────────────────
function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@campusops.ma');
  const [password, setPassword] = useState('Admin123!');
  const [roleKey, setRoleKey] = useState('admin');
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(roleKey); }, 700);
  };

  const pickRole = (r) => {
    setRoleKey(r.key);
    setEmail(r.email);
    const pwmap = { admin:'Admin123!', scolarite:'Scolar123!', enseignant:'Prof123!', etudiant:'Student123!' };
    setPassword(pwmap[r.key]);
  };

  return (
    <div className="login-wrap">
      <div className="login-side">
        <div className="login-orb" style={{width:420,height:420,background:'#3b82f6',top:-80,left:-80}}/>
        <div className="login-orb" style={{width:300,height:300,background:'#06b6d4',bottom:-50,right:-50}}/>
        <div className="login-orb" style={{width:260,height:260,background:'#8b5cf6',top:'40%',right:'20%'}}/>
        <div className="login-brand-block">
          <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'5px 12px',
                       background:'rgba(26,86,219,0.15)',border:'1px solid rgba(26,86,219,0.3)',
                       borderRadius:99,fontSize:11,fontWeight:700,color:'#60a5fa',letterSpacing:2,
                       textTransform:'uppercase',marginBottom:24}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'var(--success)'}}/>
            UEMF · 2025/2026
          </div>
          <h1>Your Campus,<br/><span className="g">Brilliantly Managed.</span></h1>
          <p>Planning, attendance, payments, and academic progress — seamlessly connected across four roles and every branch at UEMF.</p>
          <div className="login-stats">
            <div className="login-stat"><div className="v">1,247</div><div className="l">Students</div></div>
            <div className="login-stat"><div className="v">85+</div><div className="l">Modules</div></div>
            <div className="login-stat"><div className="v">96%</div><div className="l">Attendance</div></div>
          </div>
        </div>
      </div>

      <div className="login-panel">
        <form className="login-form" onSubmit={submit}>
          <div className="brand-mark">
            <div className="logo">C</div>
            <span>CampusOps</span>
          </div>
          <h2>Welcome back</h2>
          <p className="subtitle">Sign in with your role to access the dashboard.</p>

          <div className="role-picker">
            {D2.roles.map(r => (
              <div key={r.key}
                   className={`role-opt ${r.key===roleKey ? 'active' : ''}`}
                   onClick={() => pickRole(r)}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span style={{width:7,height:7,borderRadius:'50%',background:r.color}}/>
                  <span className="rn">{r.name}</span>
                </div>
                <div className="re">{r.key}</div>
              </div>
            ))}
          </div>

          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>

          <div className="login-footer">
            Demo credentials auto-fill when you pick a role · Protected by JWT
          </div>
        </form>
      </div>
    </div>
  );
}

window.Login = Login;
