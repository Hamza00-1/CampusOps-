// CampusOps — Login (Email/Password → OTP)
const { useState, useRef, useEffect } = React;

function Login({ onAuth }) {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('admin@campusops.ma');
  const [pwd, setPwd] = useState('Admin123!');
  const [otp, setOtp] = useState(['','','','','','']);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const otpRefs = useRef([]);

  const DEMO_ACCS = {
    admin: { email: 'admin@campusops.ma', pwd: 'Admin123!' },
    scolarite: { email: 'scolarite@campusops.ma', pwd: 'Scolar123!' },
    enseignant: { email: 'prof@campusops.ma', pwd: 'Prof123!' },
    etudiant: { email: 'student@campusops.ma', pwd: 'Student123!' },
  };

  useEffect(() => { 
    if (DEMO_ACCS[role]) {
      setEmail(DEMO_ACCS[role].email); 
      setPwd(DEMO_ACCS[role].pwd);
    }
  }, [role]);

  function submit(e){
    e.preventDefault();
    setStep(2);
    setTimeout(() => otpRefs.current[0]?.focus(), 80);
  }

  async function performLogin() {
    setError('');
    setLoading(true);
    try {
      const res = await window.api.request('/auth/login', {
        method: 'POST', body: { email, password: pwd }, noAuth: true
      });
      window.api.setTokens(res.data.accessToken, res.data.refreshToken);
      onAuth(res.data.user);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  function changeOtp(i, v){
    if(!/^\d?$/.test(v)) return;
    const next = [...otp]; next[i] = v; setOtp(next);
    if(v && i<5) otpRefs.current[i+1]?.focus();
    if(next.every(d => d!=='')) setTimeout(() => performLogin(), 280);
  }

  function otpKey(i, e){
    if(e.key==='Backspace' && !otp[i] && i>0) otpRefs.current[i-1]?.focus();
  }

  function pasteOtp(e){
    const d = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6).split('');
    if(d.length){ 
      e.preventDefault(); 
      const n=['','','','','','']; 
      d.forEach((x,i)=>n[i]=x); 
      setOtp(n); 
      if(d.length===6) setTimeout(()=>performLogin(),280); 
    }
  }

  return (
    <div className="login">
      <div className="login-hero">
        <div className="logo">
          <div className="logo-mark" style={{background:'#fff',padding:6}}>
            <svg viewBox="0 0 40 40" width="40" height="40">
              <defs><linearGradient id="ue-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7CB342"/><stop offset="1" stopColor="#558B2F"/></linearGradient></defs>
              <path d="M8 6 L8 22 Q8 32 20 32 Q32 32 32 22 L32 6 L26 6 L26 22 Q26 26 20 26 Q14 26 14 22 L14 6 Z" fill="url(#ue-g)"/>
              <circle cx="20" cy="16" r="2.5" fill="#fff"/>
            </svg>
          </div>
          <div>
            <div className="logo-txt">UEMF CampusOps</div>
            <div style={{fontSize:10.5,opacity:.85,letterSpacing:1.8,textTransform:'uppercase',marginTop:2,fontWeight:500}}>Université Euromed · Academic Platform</div>
          </div>
        </div>
        <div className="hero-body">
          <h1>Where academic operations come together.</h1>
          <p className="lead">Planning, attendance, progress and payments — unified in a single, secure workspace for administrators, faculty and students of the EIDIA school.</p>
          <div className="badges">
            <span className="hbadge">🔒 JWT protected</span>
            <span className="hbadge">🌐 Postgres & Redis</span>
            <span className="hbadge">⚡ Real API backend</span>
          </div>
        </div>
        <div className="foot">
          <span>© 2026 CampusOps Platform</span>
          <span>Privacy</span>
          <span>Terms</span>
          <span>Support</span>
        </div>
      </div>

      <div className="login-form-wrap">
        {step===1 ? (
          <form className="login-form" onSubmit={submit}>
            <h2>Sign in to your workspace</h2>
            <div className="sub">Use your campus credentials to continue.</div>
            <div style={{fontSize:11,fontWeight:600,color:'var(--text-2)',marginBottom:8,letterSpacing:0.3,textTransform:'uppercase'}}>Demo — select a role</div>
            <div className="role-tabs">
              {Object.keys(DEMO_ACCS).map(r =>
                <button type="button" key={r}
                  className={`role-tab ${role===r?'active':''}`}
                  onClick={()=>setRole(r)}>{r}</button>
              )}
            </div>
            <div className="field">
              <label>Email address</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoFocus />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} />
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
                <label style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'var(--text-2)',cursor:'pointer',fontWeight:500}}>
                  <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} style={{accentColor:'var(--blue)'}} />
                  Keep me signed in
                </label>
                <a className="link" href="#" onClick={e=>e.preventDefault()}>Forgot password?</a>
              </div>
            </div>
            <button className="btn btn-primary full" type="submit" style={{marginTop:12}}>
              Continue → <span style={{opacity:.7,fontWeight:500,fontSize:12,marginLeft:4}}>2FA</span>
            </button>
            <div style={{marginTop:22,paddingTop:18,borderTop:'1px solid var(--border)',fontSize:12,color:'var(--text-3)',textAlign:'center',lineHeight:1.6}}>
              Backend running at localhost:3000
            </div>
          </form>
        ) : (
          <form className="login-form" onSubmit={e=>{e.preventDefault(); performLogin();}}>
            <button type="button" onClick={()=>setStep(1)} className="link" style={{marginBottom:20,display:'inline-flex',alignItems:'center',gap:4}}>← Back</button>
            <h2>Two-factor verification</h2>
            <div className="sub">We've sent a 6-digit code to your authenticator app.</div>
            
            {error && <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--red-50)', color: 'var(--red)', fontSize: 12, marginBottom: 14, border: '1px solid #FECACA' }}>⚠ {error}</div>}

            <div className="otp-info">
              <span>✉</span>
              <span>Code sent to <strong>{email.replace(/(.{2}).*(@.*)/,'$1•••$2')}</strong></span>
            </div>
            <div className="field">
              <label>Verification code</label>
              <div className="otp-boxes">
                {otp.map((d,i) =>
                  <input key={i} ref={el=>otpRefs.current[i]=el}
                    maxLength="1" value={d} disabled={loading}
                    onChange={e=>changeOtp(i, e.target.value)}
                    onKeyDown={e=>otpKey(i,e)}
                    onPaste={i===0?pasteOtp:undefined} />
                )}
              </div>
              <div className="hint">Enter any 6 digits to continue (demo mode)</div>
            </div>
            <button className="btn btn-primary full" type="submit" style={{marginTop:12}} disabled={otp.some(d=>!d) || loading}>
              {loading ? 'Verifying...' : 'Verify & sign in'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

window.Login = Login;
