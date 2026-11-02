export type TipoNotificacion =
  | 'ASIGNACION'
  | 'CAMBIO_ESTADO'
  | 'REASIGNACION'
  | 'SOLICITUD_REASIGNACION';

export interface Notificacion {
  id: number;
  usuarioId: number;
  tipo: TipoNotificacion | string;
  titulo: string;
  mensaje: string;
  incidenciaId: number | null;
  codigoTicket: string | null;
  leida: boolean;
  fechaCreacion: string;
}

