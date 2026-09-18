import { API_BASE } from '../config/api';
import { getToken, logout } from './auth';

/**
 * Wrapper de fetch que agrega automáticamente el token JWT
 * y maneja respuestas 401 (sesión expirada o token inválido).
 */
export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();

  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Solo agregar Content-Type JSON si no es FormData y no tiene header ya definido
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Si el backend responde 401 o 403, la sesión expiró o el token es inválido
  if (response.status === 401 || response.status === 403) {
    logout();
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
    throw new Error('Sesión expirada o no autorizada. Redirigiendo al login...');
  }

  return response;
}
