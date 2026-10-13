export interface UsuarioSession {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  token: string;
}

const STORAGE_KEY = 'usuario';

export function getCurrentUser(): UsuarioSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as UsuarioSession;
    if (!user || !user.token) return null;
    return user;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return getCurrentUser()?.token ?? null;
}

export function isTokenExpired(token?: string | null): boolean {
  const t = token ?? getToken();
  if (!t) return true;
  try {
    // Lectura del payload en base64 para chequeo local sin llamada HTTP
    const parts = t.split('.');
    if (parts.length < 2) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export function getTimeUntilExpiration(): number | null {
  const token = getToken();
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return null;
    const remaining = payload.exp * 1000 - Date.now();
    return remaining > 0 ? remaining : 0;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  const user = getCurrentUser();
  if (!user || !user.token) return false;
  if (isTokenExpired(user.token)) {
    logout();
    return false;
  }
  return true;
}

export function saveSession(usuario: UsuarioSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Sincroniza el estado de autenticación entre pestañas abiertas
export function onSessionChange(callback: (user: UsuarioSession | null) => void): () => void {
  const handler = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      if (!event.newValue) {
        callback(null);
      } else {
        try {
          const user = JSON.parse(event.newValue) as UsuarioSession;
          callback(user);
        } catch {
          callback(null);
        }
      }
    }
  };

  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
