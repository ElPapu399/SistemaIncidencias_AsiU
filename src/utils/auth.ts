export interface UsuarioSession {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  token: string;
}

const STORAGE_KEY = 'usuario';

/**
 * Obtiene el usuario actual desde localStorage.
 * Retorna null si no hay sesión activa o si los datos están corruptos.
 */
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

/**
 * Obtiene el token JWT del usuario actual.
 */
export function getToken(): string | null {
  return getCurrentUser()?.token ?? null;
}

/**
 * Verifica si un token JWT ha expirado leyendo el claim 'exp'.
 */
export function isTokenExpired(token?: string | null): boolean {
  const t = token ?? getToken();
  if (!t) return true;
  try {
    const parts = t.split('.');
    if (parts.length < 2) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    // Date.now() está en ms, exp está en segundos
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

/**
 * Retorna el tiempo restante en milisegundos antes de que el token expire.
 * Retorna 0 si ya expiró o null si no hay token.
 */
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

/**
 * Verifica si hay una sesión activa y válida (no expirada).
 */
export function isLoggedIn(): boolean {
  const user = getCurrentUser();
  if (!user || !user.token) return false;
  if (isTokenExpired(user.token)) {
    logout();
    return false;
  }
  return true;
}

/**
 * Guarda los datos de sesión (incluyendo token) en localStorage.
 */
export function saveSession(usuario: UsuarioSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
}

/**
 * Cierra sesión: elimina datos de localStorage.
 * El evento 'storage' se dispara automáticamente en las otras pestañas.
 */
export function logout(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Registra un listener para detectar cambios de sesión en otras pestañas.
 * Cuando otra pestaña hace logout (elimina 'usuario' de localStorage),
 * el callback se ejecuta en TODAS las demás pestañas abiertas con `null`.
 * Si otra pestaña inicia sesión, se pasa el nuevo usuario.
 *
 * Retorna una función cleanup para desregistrar el listener.
 */
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
