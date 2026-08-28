import type {
  Incident,
  Categoria,
  Ubicacion,
  Prioridad,
  Tecnico,
  CreateIncidentData,
} from '../types/incident';

const API_BASE = 'http://localhost:8080/api';

export async function obtenerIncidencias(): Promise<Incident[]> {
  const response = await fetch(`${API_BASE}/incidencias`);

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
  const response = await fetch(`${API_BASE}/incidencias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Error al crear la incidencia');
  }

  return response.json();
}

export async function asignarTecnico(incidenciaId: number, tecnicoId: number): Promise<void> {
  const response = await fetch(`${API_BASE}/incidencias/${incidenciaId}/asignar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
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
  solucionTecnica?: string
): Promise<void> {
  const response = await fetch(`${API_BASE}/incidencias/${incidenciaId}/estado`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado, solucionTecnica }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Error al actualizar el estado de la incidencia');
  }
}

export async function obtenerCategorias(): Promise<Categoria[]> {
  const response = await fetch(`${API_BASE}/categorias`);
  if (!response.ok) throw new Error('Error al cargar categorías');
  return response.json();
}

export async function obtenerUbicaciones(): Promise<Ubicacion[]> {
  const response = await fetch(`${API_BASE}/ubicaciones`);
  if (!response.ok) throw new Error('Error al cargar ubicaciones');
  return response.json();
}

export async function obtenerPrioridades(): Promise<Prioridad[]> {
  const response = await fetch(`${API_BASE}/prioridades`);
  if (!response.ok) throw new Error('Error al cargar prioridades');
  return response.json();
}

export async function obtenerTecnicosPorEspecialidad(especialidadId?: number): Promise<Tecnico[]> {
  const url = especialidadId
    ? `${API_BASE}/usuarios/tecnicos?especialidadId=${especialidadId}`
    : `${API_BASE}/usuarios/tecnicos`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Error al cargar técnicos');
  return response.json();
}