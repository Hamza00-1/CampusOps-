// CampusOps — Login
const { useState: uSL, useEffect: uEL } = React;

const DEMO_CREDS = {
  admin:      { email: 'admin@campusops.ma',     password: 'Admin123!' },
  scolarite:  { email: 'scolarite@campusops.ma', password: 'Scolar123!' },
  enseignant: { email: 'prof@campusops.ma',       password: 'Prof123!' },
  etudiant:   { email: 'student@campusops.ma',    password: 'Student123!' },
};

function Login({ onAuth }) {
  const { t, lang, setLang } = useI18n();
  const [role, setRole]     = uSL('admin');
  const [email, setEmail]   = uSL(DEMO_CREDS.admin.email);
  const [pwd, setPwd]       = uSL(DEMO_CREDS.admin.password);
  const [loading, setLoading] = uSL(false);
  const [error, setError]   = uSL('');

  // Auto-fill credentials when role changes
  uEL(() => {
    const c = DEMO_CREDS[role];
    if (c) { setEmail(c.email); setPwd(c.password); }
  }, [role]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await window.api.request('/auth/login', {
        method: 'POST',
        body: { email, password: pwd },
        noAuth: true,
      });
      window.api.setTokens(res.data.accessToken, res.data.refreshToken);
      const userRole = (res.data.user.role || role).toLowerCase();
      // Inject real user data into ROLES
      ROLES[userRole] = {
        id: userRole,
        label: res.data.user.role,
        name: res.data.user.name,
        email: res.data.user.email,
        color: ROLES[userRole]?.color || '#5FA83C',
      };
      onAuth(userRole);
    } catch(err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login-hero">
        <div className="logo">
          <img src="uploads/Logo_UEMF_2016.jpg" alt="UEMF Logo" className="logo-light" style={{height: 48, width: 'auto'}} />
          <img src="uploads/UEMF.png" alt="UEMF Logo" className="logo-dark" style={{height: 48, width: 'auto'}} />
          <div className="logo-txt">CampusOps</div>
        </div>
        <div className="hero-body">
          <h1>{lang==='fr' ? "L'opérateur de votre campus." : 'Run your campus on one platform.'}</h1>
          <p className="lead">{lang==='fr' ? 'Planning, présences, notes, paiements et utilisateurs — un système unifié pour les universités modernes.' : 'Scheduling, attendance, grading, payments and people — one unified system for modern universities.'}</p>
          <div className="badges">
            <span className="hbadge">SOC 2</span>
            <span className="hbadge">FERPA-aligned</span>
            <span className="hbadge">99.99% uptime</span>
          </div>
        </div>
        <div className="foot">
          <span>© 2024 CampusOps</span>
          <span>Privacy</span>
          <span>Terms</span>
        </div>
      </div>

      <div className="login-form-wrap">
        <form className="login-form" onSubmit={submit}>
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:18}}>
            <div className="segment" style={{padding:2}}>
              <button type="button" className={lang==='en'?'active':''} onClick={()=>setLang('en')}>EN</button>
              <button type="button" className={lang==='fr'?'active':''} onClick={()=>setLang('fr')}>FR</button>
            </div>
          </div>

          <h2>{t('login.welcome')}</h2>
          <div className="sub">{lang==='fr' ? 'Connectez-vous pour continuer' : 'Sign in to continue to CampusOps'}</div>

          <div className="role-tabs">
            {Object.values(ROLES).map(r => (
              <div key={r.id} className={`role-tab ${role===r.id?'active':''}`} onClick={()=>setRole(r.id)}>
                {r.label.length>10 ? r.label.slice(0,10) : r.label}
              </div>
            ))}
          </div>

          {error && (
            <div style={{padding:'10px 12px',borderRadius:8,background:'#FEF2F2',color:'#DC2626',fontSize:12.5,marginBottom:12,border:'1px solid #FECACA',fontWeight:500}}>
              {error}
            </div>
          )}

          <div className="field">
            <label>{t('login.email')}</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="field">
            <label>{t('login.password')}</label>
            <input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} required autoComplete="current-password" />
          </div>

          <button type="submit" className="btn btn-primary full" style={{marginTop:8}} disabled={loading}>
            {loading ? (lang==='fr' ? 'Connexion…' : 'Signing in…') : t('login.signIn')}
          </button>

          <div style={{textAlign:'center',marginTop:18,fontSize:12,color:'var(--text-3)'}}>
            {lang==='fr' ? 'Identifiants pré-remplis — cliquez sur un rôle' : 'Credentials auto-filled — click a role above'}
          </div>
        </form>
      </div>
    </div>
  );
}

window.Login = Login;
