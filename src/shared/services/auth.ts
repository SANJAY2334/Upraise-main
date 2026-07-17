const TOKEN_KEY = "uprise_access_token";
const REFRESH_KEY = "uprise_refresh_token";

export type AuthUser = { id: string; email: string; role: string };

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function storeTokens(access: string, refresh: string) {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export async function apiLogout(): Promise<void> {
  const refreshToken = getRefreshToken();
  const csrfToken = await getCsrf().catch(() => "");

  clearTokens();

  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "x-csrf-token": csrfToken } : {})
      },
      body: JSON.stringify({ refreshToken })
    });
  } catch {
    // Ignore server error on logout to prevent locking UI
  }
}

async function getCsrf() {
  const r = await fetch("/api/csrf", { credentials: "include" });
  const json = (await r.json()) as { success: boolean; data: { csrfToken: string } };
  return json.data.csrfToken;
}

export async function apiLogin(
  email: string,
  password: string
): Promise<{ accessToken: string; refreshToken: string; user: AuthUser }> {
  const csrfToken = await getCsrf();
  const res = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: "Login failed." }));
    throw new Error(body.message ?? "Login failed.");
  }
  const json = (await res.json()) as {
    success: boolean;
    data: { accessToken: string; refreshToken: string; user: AuthUser };
  };
  return json.data;
}

export async function apiMe(token: string): Promise<AuthUser> {
  const res = await fetch("/api/auth/me", {
    credentials: "include",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Not authenticated.");
  const json = (await res.json()) as { success: boolean; data: { user: AuthUser } };
  return json.data.user;
}

export async function apiRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const csrfToken = await getCsrf();
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
      body: JSON.stringify({ refreshToken })
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { success: boolean; data: { accessToken: string } };
    const accessToken = json.data.accessToken;
    localStorage.setItem(TOKEN_KEY, accessToken);
    return accessToken;
  } catch {
    return null;
  }
}

/** Attach auth header and auto-refresh if 401 */
export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  let token = getAccessToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res = await fetch(input, { ...init, headers, credentials: "include" });
  if (res.status === 401) {
    token = await apiRefresh();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
      res = await fetch(input, { ...init, headers, credentials: "include" });
    }
  }
  return res;
}
