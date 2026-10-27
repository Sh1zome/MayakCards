const SESSION_KEY = 'mayak_admin_session';

const DEFAULT_PASSWORD = 'MayakAdmin';

export function getAdminPassword(): string {
  return import.meta.env.VITE_ADMIN_PASSWORD || DEFAULT_PASSWORD;
}

export function isAdminAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function loginAdmin(password: string): boolean {
  if (password === getAdminPassword()) {
    sessionStorage.setItem(SESSION_KEY, '1');
    return true;
  }
  return false;
}

export function logoutAdmin(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
