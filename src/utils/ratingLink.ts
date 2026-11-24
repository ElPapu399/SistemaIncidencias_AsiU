import type { Incident } from '../types/incident';

// Solo permite destinos internos del dashboard, nunca URLs externas del correo.
export function postLoginDestination(search: string): string {
  const destination = new URLSearchParams(search).get('redirect');
  if (!destination || !destination.startsWith('/dashboard') || /[\\\r\n]/.test(destination)) return '/dashboard';
  const url = new URL(destination, 'https://asiu.invalid');
  if (url.origin !== 'https://asiu.invalid' || !/^\/dashboard(?:\/|$)/.test(url.pathname)) return '/dashboard';
  return url.pathname + url.search + url.hash;
}

export function ratingLinkResult(value: string, incidents: Incident[], userId?: number, role?: string) {
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) {
    return { incident: null, message: 'El enlace de calificación no es válido.' };
  }
  if (role !== 'ESTUDIANTE') return { incident: null, message: 'Ingresa con la cuenta del estudiante que registró la incidencia para calificarla.' };
  const incident = incidents.find((item) => item.numericId === Number(value) && item.reporterId === userId);
  if (!incident) return { incident: null, message: 'La incidencia no está disponible para esta cuenta. Verifica que ingresaste con el correo que recibió el enlace.' };
  if (incident.calificacion != null || incident.status === 'Cerrada') {
    return { incident: null, message: 'Esta incidencia ya fue calificada o está cerrada.' };
  }
  if (!['Resuelta', 'Resuelto'].includes(incident.status)) return { incident: null, message: 'La incidencia todavía no está disponible para calificar.' };
  return { incident, message: null };
}
