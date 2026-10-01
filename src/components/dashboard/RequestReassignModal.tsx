import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ArrowRightLeft } from 'lucide-react';
import type { Incident } from '../../types/incident';
import { solicitarReasignacion } from '../../services/incidenciasService';

interface RequestReassignModalProps {
  isOpen: boolean;
  incident: Incident | null;
  onClose: () => void;
  onRequested: () => void;
}

export default function RequestReassignModal({
  isOpen,
  incident,
  onClose,
  onRequested,
}: RequestReassignModalProps) {
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!incident || !incident.numericId) return;
    if (!motivo.trim()) {
      setError('Debes indicar el motivo de la reasignación.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await solicitarReasignacion(incident.numericId, motivo.trim());
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setMotivo('');
        onRequested();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error al solicitar reasignación.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMotivo('');
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!isOpen || !incident) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal Card */}
      <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-violet-500" />
              Solicitar Reasignación
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ticket: <span className="font-mono text-amber-600 font-semibold">{incident.id}</span> — {incident.title}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg bg-slate-200 hover:bg-slate-400 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Info de contexto */}
          <div className="bg-violet-50 p-3.5 rounded-xl border border-violet-200 text-xs space-y-1">
            <p>
              <strong className="text-slate-600">Categoría:</strong>{' '}
              <span className="text-slate-800 font-semibold">{incident.category}</span>
            </p>
            <p>
              <strong className="text-slate-600">Especialidad:</strong>{' '}
              <span className="text-violet-600 font-semibold">{incident.especialidad || 'General'}</span>
            </p>
            <p>
              <strong className="text-slate-600">Ubicación:</strong>{' '}
              <span className="text-slate-800 font-semibold">{incident.location}</span>
            </p>
          </div>

          {/* Aviso */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
            <strong>Nota:</strong> Al solicitar reasignación, un técnico de soporte o administrador
            revisará tu solicitud y decidirá si aprueba o rechaza la reasignación.
          </div>

          {success ? (
            <div className="text-emerald-600 text-sm bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-4 text-center font-semibold">
              ✅ Solicitud enviada correctamente. El administrador será notificado.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Motivo de la reasignación *
                </label>
                <textarea
                  rows={4}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Explica por qué necesitas ser reasignado de esta incidencia. Ej: No cuento con la especialidad requerida, necesito herramientas específicas, etc."
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                  required
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-white hover:bg-red-500/80 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !motivo.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : (
                    <>
                      <ArrowRightLeft className="w-4 h-4" />
                      Enviar Solicitud
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
