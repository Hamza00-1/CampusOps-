const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function getToken(): string | null {
  return localStorage.getItem('co_access');
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem('co_access', access);
  localStorage.setItem('co_refresh', refresh);
}

export function clearTokens() {
  localStorage.removeItem('co_access');
  localStorage.removeItem('co_refresh');
}

async function refreshAccessToken(): Promise<string | null> {
  const rt = localStorage.getItem('co_refresh');
  if (!rt) return null;
  try {
    const res = await fetch(`${API}/auth/refresh`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) { clearTokens(); return null; }
    const json = await res.json();
    setTokens(json.data.accessToken, json.data.refreshToken);
    return json.data.accessToken;
  } catch { clearTokens(); return null; }
}

export async function api<T = unknown>(
  path: string,
  opts: { method?: string; body?: unknown; noAuth?: boolean } = {},
): Promise<T> {
  const { method = 'GET', body, noAuth } = opts;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (!noAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(`${API}${path}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  });

  // Auto-refresh on 401
  if (res.status === 401 && !noAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${API}${path}`, {
        method, headers, body: body ? JSON.stringify(body) : undefined,
      });
    }
  }

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `API error ${res.status}`);
  return json;
}
