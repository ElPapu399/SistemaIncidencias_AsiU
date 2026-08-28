import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faSpinner, faCheckCircle, faClock } from '@fortawesome/free-solid-svg-icons';
import type { Incident, IncidentStatus } from '../../types/incident';
import { cambiarEstado } from '../../services/incidenciasService';
import { StatusBadge, PriorityBadge, formatDate } from './IncidentBadges';

interface ChangeStatusModalProps {
  isOpen: boolean;
  incident: Incident | null;
  currentUserRole?: string;
  onClose: () => void;
  onUpdated: () => void;
}

export default function ChangeStatusModal({
  isOpen,
  incident,
  currentUserRole,
  onClose,
  onUpdated,
}: ChangeStatusModalProps) {
  const [nuevoEstado, setNuevoEstado] = useState<IncidentStatus>('Pendiente');
  const [solucionTecnica, setSolucionTecnica] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !incident) return;
    setError('');
    setNuevoEstado(incident.status);
    setSolucionTecnica(incident.solucionTecnica || '');
  }, [isOpen, incident]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident || !incident.numericId) return;

    if (nuevoEstado === 'Resuelto' && !solucionTecnica.trim()) {
      setError('La solución técnica es obligatoria para marcar como Resuelto.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await cambiarEstado(
        incident.numericId,
        nuevoEstado,
        nuevoEstado === 'Resuelto' ? solucionTecnica.trim() : undefined
      );
      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el estado.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !incident) return null;

  const canEdit = currentUserRole === 'ADMIN' || currentUserRole === 'TECNICO';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div>
            <span className="text-xs font-mono text-amber-400 font-semibold">{incident.id}</span>
            <h3 className="text-lg font-bold text-white leading-tight mt-0.5">{incident.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Badges & Meta */}
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-800">
            <StatusBadge status={incident.status} />
            <PriorityBadge priority={incident.priority} />
            <span className="text-xs text-slate-400 ml-auto flex items-center gap-1.5">
              <FontAwesomeIcon icon={faClock} />
              {formatDate(incident.createdAt)}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
            <div>
              <span className="text-slate-500 uppercase tracking-wider block font-semibold">Reportado por</span>
              <span className="text-white font-medium">{incident.reporter}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase tracking-wider block font-semibold">Técnico Asignado</span>
              <span className="text-white font-medium">{incident.assignee}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase tracking-wider block font-semibold">Ubicación</span>
              <span className="text-white font-medium">{incident.location}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase tracking-wider block font-semibold">Categoría</span>
              <span className="text-white font-medium">
                {incident.category} {incident.especialidad ? `(${incident.especialidad})` : ''}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Descripción
            </label>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {incident.description}
            </div>
          </div>

          {/* Technical Solution (if resolved or editing) */}
          {incident.solucionTecnica && !canEdit && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faCheckCircle} /> Solución Técnica
              </label>
              <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-3.5 text-sm text-emerald-200">
                {incident.solucionTecnica}
              </div>
            </div>
          )}

          {/* Edit section for Admin/Technician */}
          {canEdit && (
            <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Cambiar estado *
                </label>
                <select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value as IncidentStatus)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Resuelto">Resuelto</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              {nuevoEstado === 'Resuelto' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1.5">
                    Solución técnica aplicada *
                  </label>
                  <textarea
                    rows={3}
                    value={solucionTecnica}
                    onChange={(e) => setSolucionTecnica(e.target.value)}
                    placeholder="Describe los pasos y repuestos aplicados para solucionar la incidencia..."
                    className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>
              )}

              {error && (
                <div className="text-red-400 text-sm bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-slate-950 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Guardar Estado'}
                </button>
              </div>
            </form>
          )}

          {!canEdit && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
