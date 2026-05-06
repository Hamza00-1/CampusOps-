export function StatCard({ label, value, delta, trend, icon, color = 'blue' }: {
  label: string; value: string | number; delta?: string; trend?: 'up' | 'down' | 'flat'; icon: string; color?: string;
}) {
  const arrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  return (
    <div className="stat">
      <div className="stat-h">
        <div className="stat-ic" style={{ background: `var(--${color}-50)`, color: `var(--${color === 'green' ? 'green-600' : color})` }}>{icon}</div>
        {delta && <span className={`trend ${trend || 'flat'}`}>{arrow} {delta}</span>}
      </div>
      <div className="stat-v">{value}</div>
      <div className="stat-l">{label}</div>
    </div>
  );
}

export function Ring({ value, color = 'var(--blue)', size = 56 }: { value: number; color?: string; size?: number }) {
  const r = size / 2 - 5, c = 2 * Math.PI * r;
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F5F9" strokeWidth="5" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
      </svg>
      <div className="rv" style={{ color }}>{value}%</div>
    </div>
  );
}

export function Spinner() {
  return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
    <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
  </div>;
}

export function Empty({ message = 'No data found' }: { message?: string }) {
  return <div className="empty">{message}</div>;
}
