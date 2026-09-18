import type {
  Incident,
  Categoria,
  Ubicacion,
  Prioridad,
  Tecnico,
  CreateIncidentData,
} from '../types/incident';
import { fetchWithAuth } from '../utils/fetchWithAuth';
import { getCurrentUser } from '../utils/auth';

export async function obtenerIncidencias(): Promise<Incident[]> {
  const response = await fetchWithAuth('/incidencias');

  if (!response.ok) {
    throw new Error('Error al obtener las incidencias');
  }

  const data = await response.json();

  return data.map((inc: any): Incident => ({
    id: inc.codigoTicket || `INC-${inc.id}`,
    numericId: inc.id,
    title: inc.titulo,
    description: inc.descripcion,
    category: inc.categoriaNombre || 'Sin categoría',
    especialidad: inc.especialidadNombre || undefined,
    priority: inc.prioridadNivel || 'Media',
    status: inc.estado || 'Pendiente',
    reporter: inc.estudianteNombre || 'Sin estudiante',
    reporterId: inc.estudianteId,
    assignee: inc.tecnicoNombre || 'Sin asignar',
    assigneeId: inc.tecnicoId,
    location: inc.ubicacionTexto || 'Sin ubicación',
    locationId: inc.ubicacionId,
    solucionTecnica: inc.solucionTecnica,
    createdAt: inc.fechaCreacion,
    startedAt: inc.fechaInicioAtencion,
    closedAt: inc.fechaCierre,
  }));
}

export async function crearIncidencia(data: CreateIncidentData): Promise<Incident> {
  const response = await fetchWithAuth('/incidencias', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Error al crear la incidencia');
  }

  return response.json();
}

export async function asignarTecnico(incidenciaId: number, tecnicoId: number): Promise<void> {
  const response = await fetchWithAuth(`/incidencias/${incidenciaId}/asignar`, {
    method: 'PUT',
    body: JSON.stringify({ tecnicoId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Error al asignar el técnico');
  }
}

export async function cambiarEstado(
  incidenciaId: number,
  estado: string,
  solucionTecnica?: string,
  usuarioId?: number
): Promise<void> {
  const currentUserId = usuarioId ?? getCurrentUser()?.id;
  const response = await fetchWithAuth(`/incidencias/${incidenciaId}/estado`, {
    method: 'PUT',
    body: JSON.stringify({
      estado,
      solucionTecnica,
      usuarioId: currentUserId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Error al actualizar el estado de la incidencia');
  }
}

export async function obtenerCategorias(): Promise<Categoria[]> {
  const response = await fetchWithAuth('/categorias');
  if (!response.ok) throw new Error('Error al cargar categorías');
  return response.json();
}

export async function obtenerUbicaciones(): Promise<Ubicacion[]> {
  const response = await fetchWithAuth('/ubicaciones');
  if (!response.ok) throw new Error('Error al cargar ubicaciones');
  return response.json();
}

export async function obtenerPrioridades(): Promise<Prioridad[]> {
  const response = await fetchWithAuth('/prioridades');
  if (!response.ok) throw new Error('Error al cargar prioridades');
  return response.json();
}

export async function obtenerTecnicosPorEspecialidad(especialidadId?: number): Promise<Tecnico[]> {
  const endpoint = especialidadId
    ? `/usuarios/tecnicos?especialidadId=${especialidadId}`
    : '/usuarios/tecnicos';
  const response = await fetchWithAuth(endpoint);
  if (!response.ok) throw new Error('Error al cargar técnicos');
  return response.json();
}