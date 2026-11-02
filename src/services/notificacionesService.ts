import { fetchWithAuth } from '../utils/fetchWithAuth';
import type { Notificacion } from '../types/notificacion';

export async function obtenerNotificaciones(): Promise<Notificacion[]> {
  const response = await fetchWithAuth('/notificaciones');
  if (!response.ok) {
    throw new Error('Error al obtener notificaciones');
  }
  return response.json();
}

export async function obtenerConteoNoLeidas(): Promise<number> {
  const response = await fetchWithAuth('/notificaciones/no-leidas/conteo');
  if (!response.ok) {
    return 0;
  }
  const data = await response.json();
  return typeof data.total === 'number' ? data.total : 0;
}

export async function marcarComoLeida(id: number): Promise<void> {
  const response = await fetchWithAuth(`/notificaciones/${id}/leer`, {
    method: 'PUT',
  });
  if (!response.ok) {
    throw new Error('Error al marcar notificación como leída');
  }
}

export async function marcarTodasComoLeidas(): Promise<void> {
  const response = await fetchWithAuth('/notificaciones/leer-todas', {
    method: 'PUT',
  });
  if (!response.ok) {
    throw new Error('Error al marcar todas las notificaciones como leídas');
  }
}

