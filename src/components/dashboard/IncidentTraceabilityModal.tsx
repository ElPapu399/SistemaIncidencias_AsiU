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
  const [sortAsc, setSortAsc] = useState(false); // false = más reciente primero

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
        color: 'text-violet-600',
        bgColor: 'bg-violet-100',
        borderColor: 'border-violet-300',
        badgeBg: 'bg-violet-50 text-violet-700 border-violet-200',
      };
    }
    if (t === 'SOLICITUD_REASIGNACION' || c.includes('solicitud de reasignación')) {
      return {
        label: 'Solicitud de Reasignación',
        icon: AlertCircle,
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        borderColor: 'border-amber-300',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      };
    }
    if (t === 'RECHAZO_REASIGNACION' || c.includes('rechazad')) {
      return {
        label: 'Reasignación Rechazada',
        icon: X,
        color: 'text-rose-600',
        bgColor: 'bg-rose-100',
        borderColor: 'border-rose-300',
        badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      };
    }
    if (t === 'ASIGNACION' || c.includes('técnico asignado') || c.includes('autoasignado')) {
      return {
        label: 'Asignación de Técnico',
        icon: UserCheck,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-300',
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      };
    }
    if (estadoNuevo === 'Resuelta' || estadoNuevo === 'Resuelto' || c.includes('resuelta') || c.includes('solución')) {
      return {
        label: 'Incidencia Resuelta',
        icon: CheckCircle2,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100',
        borderColor: 'border-emerald-300',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    }
    if (c.includes('ticket registrado') || c.includes('cread') || !t) {
      return {
        label: 'Registro de Incidencia',
        icon: FileText,
        color: 'text-sky-600',
        bgColor: 'bg-sky-100',
        borderColor: 'border-sky-300',
        badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
      };
    }
    return {
      label: 'Actualización de Estado',
      icon: RefreshCw,
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
      borderColor: 'border-slate-300',
      badgeBg: 'bg-slate-50 text-slate-700 border-slate-200',
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
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden z-10">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700 shrink-0 shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-violet-700 bg-violet-100/70 px-2 py-0.5 rounded-lg border border-violet-200">
                  {incident.id}
                </span>
                <span className="text-xs text-slate-500 font-medium">Trazabilidad de Acciones</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-snug mt-1">
                {incident.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-200/70 hover:bg-slate-300 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Resumen Superior de Trazabilidad */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={incident.status} />
            <PriorityBadge priority={incident.priority} />

            {/* Técnico Asignado / Reasignado */}
            {incident.fueReasignada && incident.tecnicoAnteriorNombre ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-violet-50 text-violet-800 rounded-xl border border-violet-200 font-medium">
                <ArrowRightLeft className="w-3.5 h-3.5 text-violet-600" />
                <span className="line-through text-slate-400">{incident.tecnicoAnteriorNombre}</span>
                <span className="text-violet-600 font-bold">➔</span>
                <span className="font-bold text-slate-900">{incident.assignee}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-xl border border-slate-200 font-medium">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Asignado: <strong>{incident.assignee}</strong></span>
              </div>
            )}
          </div>

          {/* Botón para ordenar cronología */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSortAsc((prev) => !prev)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200"
              title="Alternar orden cronológico"
            >
              <ArrowUpDown className="w-3 h-3 text-slate-500" />
              <span>{sortAsc ? 'Más antiguos primero' : 'Más recientes primero'}</span>
            </button>

            <button
              type="button"
              onClick={cargarHistorial}
              disabled={loading}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Refrescar trazabilidad"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Timeline Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50/50">
          {loading ? (
            <div className="py-16 text-center text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-violet-500" />
              <p className="font-medium text-sm">Cargando línea de tiempo de trazabilidad...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs">
              {error}
            </div>
          ) : sortedHistorial.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <Clock className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-medium text-sm text-slate-600">Sin eventos de trazabilidad</p>
              <p className="text-xs text-slate-400 mt-1">Aún no se han registrado cambios en esta incidencia.</p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
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
                    <div className="ml-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs hover:shadow-md transition-shadow">
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
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {item.estadoAnterior} ➔ <strong className="text-slate-800">{item.estadoNuevo}</strong>
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(item.fechaCambio)}
                        </span>
                      </div>

                      {/* Responsable de la acción */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium mb-2">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          Ejecutado por:{' '}
                          <strong className="text-slate-900 font-semibold">
                            {item.usuarioNombre || 'Sistema'}
                          </strong>
                        </span>
                      </div>

                      {/* Detalle de reasignación si hubo técnicos */}
                      {item.tecnicoAnteriorNombre && item.tecnicoNuevoNombre && (
                        <div className="mb-2 p-2 bg-violet-50/70 border border-violet-200/70 rounded-xl text-xs flex items-center gap-2 flex-wrap">
                          <span className="text-violet-800 font-semibold flex items-center gap-1">
                            <ArrowRightLeft className="w-3 h-3 text-violet-600" />
                            Cambio de Técnico:
                          </span>
                          <span className="line-through text-slate-400">{item.tecnicoAnteriorNombre}</span>
                          <span className="text-violet-600 font-bold">➔</span>
                          <span className="font-bold text-slate-900">{item.tecnicoNuevoNombre}</span>
                        </div>
                      )}

                      {/* Comentario / Justificación / Motivo */}
                      {item.comentario && (
                        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
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
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Registro inmutable de trazabilidad y auditoría de campus</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
