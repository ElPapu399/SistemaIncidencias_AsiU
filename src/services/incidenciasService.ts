import type {
  Incident,
  Categoria,
  Ubicacion,
  Prioridad,
  Tecnico,
  CreateIncidentData,
  ArchivoAdjunto,
} from '../types/incident';
import { fetchWithAuth } from '../utils/fetchWithAuth';
import { getCurrentUser } from '../utils/auth';
import { API_BASE } from '../config/api';

/**
 * Convierte una URL relativa de archivo adjunto en una URL absoluta funcional.
 */
export function getAttachmentUrl(urlArchivo?: string | number | null): string {
  if (!urlArchivo) return '';
  const str = String(urlArchivo).trim();
  if (!str) return '';
  if (str.startsWith('http://') || str.startsWith('https://')) {
    return str;
  }
  const baseUrl = API_BASE.replace(/\/api\/?$/, '');
  const cleanPath = str.startsWith('/') ? str : `/${str}`;
  return `${baseUrl}${cleanPath}`;
}

function mapIncidentDto(inc: any): Incident {
  return {
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
    fueReasignada: Boolean(inc.fueReasignada),
    tecnicoAnteriorId: inc.tecnicoAnteriorId ?? null,
    tecnicoAnteriorNombre: inc.tecnicoAnteriorNombre ?? null,
    reasignadoPorNombre: inc.reasignadoPorNombre ?? null,
    motivoReasignacion: inc.motivoReasignacion ?? null,
    fechaReasignacion: inc.fechaReasignacion ?? null,
    asignadoPorNombre: inc.asignadoPorNombre ?? null,
  };
}

export async function obtenerIncidencias(): Promise<Incident[]> {
  const response = await fetchWithAuth('/incidencias');

  if (!response.ok) {
    throw new Error('Error al obtener las incidencias');
  }

  const data = await response.json();
  return data.map(mapIncidentDto);
}

/**
 * Obtiene las incidencias reportadas por un estudiante en específico.
 */
export async function obtenerIncidenciasPorEstudiante(estudianteId: number): Promise<Incident[]> {
  const response = await fetchWithAuth(`/incidencias/estudiante/${estudianteId}`);

  if (!response.ok) {
    throw new Error('Error al obtener las incidencias del estudiante');
  }

  const data = await response.json();
  return data.map(mapIncidentDto);
}

/**
 * Obtiene las incidencias asignadas a un técnico en específico.
 */
export async function obtenerIncidenciasPorTecnico(tecnicoId: number): Promise<Incident[]> {
  const response = await fetchWithAuth(`/incidencias/tecnico/${tecnicoId}`);

  if (!response.ok) {
    throw new Error('Error al obtener las incidencias del técnico');
  }

  const data = await response.json();
  return data.map(mapIncidentDto);
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

/**
 * Obtiene el detalle enriquecido de una incidencia (con adjuntos e historial).
 */
export async function obtenerDetalleIncidencia(id: number): Promise<any> {
  const response = await fetchWithAuth(`/incidencias/${id}`);
  if (!response.ok) {
    throw new Error('Error al obtener el detalle de la incidencia');
  }
  return response.json();
}

/**
 * Lista los archivos adjuntos de una incidencia específica.
 */
export async function obtenerAdjuntos(incidenciaId: number): Promise<ArchivoAdjunto[]> {
  const response = await fetchWithAuth(`/incidencias/${incidenciaId}/adjuntos`);
  if (!response.ok) {
    throw new Error('Error al obtener los archivos adjuntos');
  }
  return response.json();
}

/**
 * Sube un archivo adjunto (imagen/documento de evidencia) a una incidencia.
 */
export async function subirAdjunto(
  incidenciaId: number,
  file: File,
  usuarioId?: number
): Promise<ArchivoAdjunto> {
  const formData = new FormData();
  formData.append('file', file);
  if (usuarioId) {
    formData.append('usuarioId', usuarioId.toString());
  }

  const response = await fetchWithAuth(`/incidencias/${incidenciaId}/adjuntos`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Error al subir el archivo adjunto');
  }

  return response.json();
}

// ==================== REASIGNACIÓN CON TRAZABILIDAD ====================

/**
 * Reasigna una incidencia de un técnico a otro (admin/soporte).
 * Registra quién reasignó, de quién a quién, y el motivo.
 */
export async function reasignarTecnico(
  incidenciaId: number,
  tecnicoNuevoId: number,
  motivo: string
): Promise<void> {
  const response = await fetchWithAuth(`/incidencias/${incidenciaId}/reasignar`, {
    method: 'PUT',
    body: JSON.stringify({ tecnicoNuevoId, motivo }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Error al reasignar el técnico');
  }
}

// ==================== SOLICITUDES DE REASIGNACIÓN ====================

export interface SolicitudReasignacion {
  id: number;
  incidenciaId: number;
  codigoTicket: string;
  tituloIncidencia: string;
  tecnicoSolicitanteId: number;
  tecnicoSolicitanteNombre: string;
  motivo: string;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  revisadoPorId: number | null;
  revisadoPorNombre: string | null;
  comentarioRespuesta: string | null;
  tecnicoNuevoId: number | null;
  tecnicoNuevoNombre: string | null;
  fechaSolicitud: string;
  fechaRespuesta: string | null;
}

/**
 * Un técnico solicita ser reasignado de una incidencia, explicando sus motivos.
 */
export async function solicitarReasignacion(
  incidenciaId: number,
  motivo: string
): Promise<SolicitudReasignacion> {
  const response = await fetchWithAuth(`/incidencias/${incidenciaId}/solicitar-reasignacion`, {
    method: 'POST',
    body: JSON.stringify({ motivo }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || errorData?.message || 'Error al solicitar reasignación');
  }

  return response.json();
}

/**
 * Obtiene las solicitudes de reasignación pendientes (para admin).
 */
export async function obtenerSolicitudesPendientes(): Promise<SolicitudReasignacion[]> {
  const response = await fetchWithAuth('/solicitudes-reasignacion/pendientes');
  if (!response.ok) throw new Error('Error al obtener solicitudes pendientes');
  return response.json();
}

/**
 * Obtiene todas las solicitudes de reasignación (historial).
 */
export async function obtenerTodasSolicitudes(): Promise<SolicitudReasignacion[]> {
  const response = await fetchWithAuth('/solicitudes-reasignacion');
  if (!response.ok) throw new Error('Error al obtener solicitudes');
  return response.json();
}

/**
 * Admin aprueba o rechaza una solicitud de reasignación.
 */
export async function responderSolicitud(
  solicitudId: number,
  decision: 'APROBADA' | 'RECHAZADA',
  comentario?: string,
  tecnicoNuevoId?: number
): Promise<SolicitudReasignacion> {
  const response = await fetchWithAuth(`/solicitudes-reasignacion/${solicitudId}/responder`, {
    method: 'PUT',
    body: JSON.stringify({ decision, comentario, tecnicoNuevoId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || errorData?.message || 'Error al responder solicitud');
  }

  return response.json();
}