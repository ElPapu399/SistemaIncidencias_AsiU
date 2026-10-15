import { API_BASE } from '../config/api';
import { getToken, logout } from './auth';

export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();

  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Para FormData el navegador debe calcular el Content-Type con su propio boundary
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

  // Solo 401 invalida la autenticación. Un 403 no debe borrar una sesión válida.
  if (response.status === 401) {
    logout();
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
    throw new Error('Sesión expirada o credenciales inválidas. Redirigiendo al login...');
  }

  return response;
}
