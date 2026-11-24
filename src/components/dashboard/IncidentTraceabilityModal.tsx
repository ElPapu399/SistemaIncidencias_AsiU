import Button from '../Button';
import { useState, useEffect, useCallback } from 'react';
import type { Incident } from '../../types/incident';
import { obtenerDetalleIncidencia } from '../../services/incidenciasService';
import { StatusBadge, PriorityBadge } from './IncidentBadges';
import {
  History,
  X,
  ArrowRightLeft,
  UserCheck,
  CheckCircle2,
  RefreshCw,
  FileText,
  Clock,
  AlertCircle,
  User,
  ArrowUpDown,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

interface IncidentTraceabilityModalProps {
  isOpen: boolean;
  incident: Incident | null;
  onClose: () => void;
}

interface HistorialItem {
  id: number;
  estadoAnterior?: string;
  estadoNuevo?: string;
  tipoAccion?: string;
  usuarioId?: number;
  usuarioNombre?: string;
  comentario?: string;
  tecnicoAnteriorId?: number;
  tecnicoAnteriorNombre?: string;
  tecnicoNuevoId?: number;
  tecnicoNuevoNombre?: string;
  fechaCambio?: string;
}

export default function IncidentTraceabilityModal({
  isOpen,
  incident,
  onClose,
}: IncidentTraceabilityModalProps) {
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const cargarHistorial = useCallback(async () => {
    if (!incident?.numericId) return;
    setLoading(true);
    setError(null);
    try {
      const detalle = await obtenerDetalleIncidencia(incident.numericId);
      setHistorial(detalle.historial || []);
    } catch (err: any) {
      console.error('Error al cargar trazabilidad:', err);
      setError('No se pudo cargar el historial de trazabilidad.');
    } finally {
      setLoading(false);
    }
  }, [incident?.numericId]);

  useEffect(() => {
    if (isOpen && incident?.numericId) {
      cargarHistorial();
    } else {
      setHistorial([]);
      setError(null);
    }
  }, [isOpen, incident?.numericId, cargarHistorial]);

  if (!isOpen || !incident) return null;

  const sortedHistorial = [...historial].sort((a, b) => {
    const dateA = a.fechaCambio ? new Date(a.fechaCambio).getTime() : 0;
    const dateB = b.fechaCambio ? new Date(b.fechaCambio).getTime() : 0;
    return sortAsc ? dateA - dateB : dateB - dateA;
  });

  const getActionConfig = (tipo?: string, estadoNuevo?: string, comentario?: string) => {
    const t = (tipo || '').toUpperCase();
    const c = (comentario || '').toLowerCase();

    if (t === 'REASIGNACION' || c.includes('reasignad')) {
      return {
        label: 'Reasignación de Técnico',
        icon: ArrowRightLeft,
        color: 'text-(--tone-violet-text-600)',
        bgColor: 'bg-(--tone-violet-bg-100)',
        borderColor: 'border-(--tone-violet-border-300)',
        badgeBg: 'bg-(--tone-violet-bg-50) text-(--tone-violet-text-700) border-(--tone-violet-border-200)',
      };
    }
    if (t === 'SOLICITUD_REASIGNACION' || c.includes('solicitud de reasignación')) {
      return {
        label: 'Solicitud de Reasignación',
        icon: AlertCircle,
        color: 'text-(--tone-amber-text-600)',
        bgColor: 'bg-(--tone-amber-bg-100)',
        borderColor: 'border-(--tone-amber-border-300)',
        badgeBg: 'bg-(--tone-amber-bg-50) text-(--tone-amber-text-700) border-(--tone-amber-border-200)',
      };
    }
    if (t === 'RECHAZO_REASIGNACION' || c.includes('rechazad')) {
      return {
        label: 'Reasignación Rechazada',
        icon: X,
        color: 'text-(--tone-rose-text-600)',
        bgColor: 'bg-(--tone-rose-bg-100)',
        borderColor: 'border-(--tone-rose-border-300)',
        badgeBg: 'bg-(--tone-rose-bg-50) text-(--tone-rose-text-700) border-(--tone-rose-border-200)',
      };
    }
    if (t === 'ASIGNACION' || c.includes('técnico asignado') || c.includes('autoasignado')) {
      return {
        label: 'Asignación de Técnico',
        icon: UserCheck,
        color: 'text-(--tone-blue-text-600)',
        bgColor: 'bg-(--tone-blue-bg-100)',
        borderColor: 'border-(--tone-blue-border-300)',
        badgeBg: 'bg-(--tone-blue-bg-50) text-(--tone-blue-text-700) border-(--tone-blue-border-200)',
      };
    }
    if (t === 'CALIFICACION' || estadoNuevo === 'Cerrada' || c.includes('calificación')) {
      return {
        label: 'Cierre y Calificación',
        icon: ShieldCheck,
        color: 'text-(--tone-amber-text-600)',
        bgColor: 'bg-(--tone-amber-bg-100)',
        borderColor: 'border-(--tone-amber-border-300)',
        badgeBg: 'bg-(--tone-amber-bg-50) text-(--tone-amber-text-700) border-(--tone-amber-border-200)',
      };
    }
    if (estadoNuevo === 'Resuelta' || estadoNuevo === 'Resuelto' || c.includes('resuelta') || c.includes('solución')) {
      return {
        label: 'Incidencia Resuelta',
        icon: CheckCircle2,
        color: 'text-(--tone-emerald-text-600)',
        bgColor: 'bg-(--tone-emerald-bg-100)',
        borderColor: 'border-(--tone-emerald-border-300)',
        badgeBg: 'bg-(--tone-emerald-bg-50) text-(--tone-emerald-text-700) border-(--tone-emerald-border-200)',
      };
    }
    if (c.includes('ticket registrado') || c.includes('cread') || !t) {
      return {
        label: 'Registro de Incidencia',
        icon: FileText,
        color: 'text-(--tone-sky-text-600)',
        bgColor: 'bg-(--tone-sky-bg-100)',
        borderColor: 'border-(--tone-sky-border-300)',
        badgeBg: 'bg-(--tone-sky-bg-50) text-(--tone-sky-text-700) border-(--tone-sky-border-200)',
      };
    }
    return {
      label: 'Actualización de Estado',
      icon: RefreshCw,
      color: 'text-(--text-secondary)',
      bgColor: 'bg-(--surface-muted)',
      borderColor: 'border-(--border-color)',
      badgeBg: 'bg-(--surface-subtle) text-(--text-primary) border-(--border-color)',
    };
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-(--surface) rounded-2xl shadow-2xl border border-(--border-color) w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden z-10">
        {/* Header */}
        <div className="px-6 py-5 border-b border-(--border-color) bg-(--surface-subtle)/80 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-(--tone-violet-bg-100) border border-(--tone-violet-border-200) flex items-center justify-center text-(--tone-violet-text-700) shrink-0 shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-(--tone-violet-text-700) bg-(--tone-violet-bg-100)/70 px-2 py-0.5 rounded-lg border border-(--tone-violet-border-200)">
                  {incident.id}
                </span>
                <span className="text-xs text-(--text-secondary) font-medium">Trazabilidad de Acciones</span>
              </div>
              <h3 className="text-base font-bold text-(--text-primary) leading-snug mt-1">
                {incident.title}
              </h3>
            </div>
          </div>

          <Button variant="cancel" appearance="soft" size="custom"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Resumen Superior de Trazabilidad */}
        <div className="px-6 py-3 bg-(--surface) border-b border-(--border-color) flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={incident.status} />
            <PriorityBadge priority={incident.priority} />

            {/* Técnico Asignado / Reasignado */}
            {incident.fueReasignada && incident.tecnicoAnteriorNombre ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-(--tone-violet-bg-50) text-(--tone-violet-text-800) rounded-xl border border-(--tone-violet-border-200) font-medium">
                <ArrowRightLeft className="w-3.5 h-3.5 text-(--tone-violet-text-600)" />
                <span className="line-through text-(--text-secondary)">{incident.tecnicoAnteriorNombre}</span>
                <span className="text-(--tone-violet-text-600) font-bold">➔</span>
                <span className="font-bold text-(--text-primary)">{incident.assignee}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-(--surface-muted) text-(--text-primary) rounded-xl border border-(--border-color) font-medium">
                <User className="w-3.5 h-3.5 text-(--text-secondary)" />
                <span>Asignado: <strong>{incident.assignee}</strong></span>
              </div>
            )}
          </div>

          {/* Botón para ordenar cronología */}
          <div className="flex items-center gap-2">
            <Button variant="neutral" appearance="soft" size="custom"
              type="button"
              onClick={() => setSortAsc((prev) => !prev)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border"
              title="Alternar orden cronológico"
            >
              <ArrowUpDown className="w-3 h-3 " />
              <span>{sortAsc ? 'Más antiguos primero' : 'Más recientes primero'}</span>
            </Button>

            <Button variant="neutral" appearance="text" size="custom"
              type="button"
              onClick={cargarHistorial}
              disabled={loading}
              className="p-1 rounded-lg transition-colors cursor-pointer"
              title="Refrescar trazabilidad"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Timeline Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-(--surface-subtle)/50">
          {loading ? (
            <div className="py-16 text-center text-(--text-secondary)">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-(--tone-violet-text-500)" />
              <p className="font-medium text-sm">Cargando línea de tiempo de trazabilidad...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-(--tone-rose-bg-50) border border-(--tone-rose-border-200) rounded-2xl text-(--tone-rose-text-700) text-xs">
              {error}
            </div>
          ) : sortedHistorial.length === 0 ? (
            <div className="py-16 text-center text-(--text-secondary) bg-(--surface) rounded-2xl border border-(--border-color)">
              <Clock className="w-10 h-10 mx-auto mb-2 text-(--text-secondary)" />
              <p className="font-medium text-sm text-(--text-secondary)">Sin eventos de trazabilidad</p>
              <p className="text-xs text-(--text-secondary) mt-1">Aún no se han registrado cambios en esta incidencia.</p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-(--surface-hover)">
              {sortedHistorial.map((item, idx) => {
                const config = getActionConfig(item.tipoAccion, item.estadoNuevo, item.comentario);
                const ActionIcon = config.icon;

                return (
                  <div key={item.id || idx} className="relative group">
                    {/* Timeline Node Point */}
                    <div
                      className={`absolute -left-6 top-1 w-6 h-6 rounded-full ${config.bgColor} ${config.borderColor} border-2 flex items-center justify-center shadow-xs transition-transform group-hover:scale-110`}
                    >
                      <ActionIcon className={`w-3 h-3 ${config.color}`} />
                    </div>

                    {/* Event Card */}
                    <div className="ml-3 bg-(--surface) border border-(--border-color)/80 rounded-2xl p-4 shadow-xs hover:shadow-md transition-shadow">
                      {/* Top Header of Card */}
                      <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${config.badgeBg}`}
                          >
                            <ActionIcon className="w-3 h-3" />
                            {config.label}
                          </span>

                          {/* Transición de Estado */}
                          {item.estadoAnterior && item.estadoNuevo && item.estadoAnterior !== item.estadoNuevo && (
                            <span className="text-[10px] font-semibold text-(--text-secondary) bg-(--surface-muted) px-2 py-0.5 rounded border border-(--border-color)">
                              {item.estadoAnterior} ➔ <strong className="text-(--text-primary)">{item.estadoNuevo}</strong>
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-(--text-secondary) font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(item.fechaCambio)}
                        </span>
                      </div>

                      {/* Responsable de la acción */}
                      <div className="flex items-center gap-1.5 text-xs text-(--text-primary) font-medium mb-2">
                        <User className="w-3.5 h-3.5 text-(--text-secondary) shrink-0" />
                        <span>
                          Ejecutado por:{' '}
                          <strong className="text-(--text-primary) font-semibold">
                            {item.usuarioNombre || 'Sistema'}
                          </strong>
                        </span>
                      </div>

                      {/* Detalle de reasignación si hubo técnicos */}
                      {item.tecnicoAnteriorNombre && item.tecnicoNuevoNombre && (
                        <div className="mb-2 p-2 bg-(--tone-violet-bg-50)/70 border border-(--tone-violet-border-200)/70 rounded-xl text-xs flex items-center gap-2 flex-wrap">
                          <span className="text-(--tone-violet-text-800) font-semibold flex items-center gap-1">
                            <ArrowRightLeft className="w-3 h-3 text-(--tone-violet-text-600)" />
                            Cambio de Técnico:
                          </span>
                          <span className="line-through text-(--text-secondary)">{item.tecnicoAnteriorNombre}</span>
                          <span className="text-(--tone-violet-text-600) font-bold">➔</span>
                          <span className="font-bold text-(--text-primary)">{item.tecnicoNuevoNombre}</span>
                        </div>
                      )}

                      {/* Comentario / Justificación / Motivo */}
                      {item.comentario && (
                        <div className="bg-(--surface-subtle) border border-(--border-color)/60 rounded-xl p-3 text-xs text-(--text-primary) leading-relaxed font-sans whitespace-pre-wrap">
                          {item.comentario}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-(--surface-subtle) border-t border-(--border-color) flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-(--text-secondary)">
            <ShieldCheck className="w-4 h-4 text-(--tone-emerald-text-600)" />
            <span>Registro inmutable de trazabilidad y auditoría de campus</span>
          </div>

          <Button variant="cancel" appearance="soft" size="custom"
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
