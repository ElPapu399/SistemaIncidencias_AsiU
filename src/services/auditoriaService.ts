import { fetchWithAuth } from '../utils/fetchWithAuth';

export interface AuditoriaLog {
  id: string;
  fecha: string;
  tipo: 'INCIDENCIA' | 'EQUIPO';
  tipoAccion: string;
  usuarioId: number | null;
  usuarioNombre: string;
  usuarioRol: string;
  usuarioEmail: string;
  entidadCodigo: string;
  entidadNombre: string;
  estadoAnterior: string | null;
  estadoNuevo: string | null;
  detalle: string;
}

export async function obtenerLogsAuditoria(): Promise<AuditoriaLog[]> {
  const resp = await fetchWithAuth('/auditoria');
  if (!resp.ok) {
    throw new Error('No se pudieron cargar los registros de auditoría.');
  }
  return resp.json();
}

