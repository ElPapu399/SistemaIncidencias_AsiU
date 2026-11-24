import Button from '../Button';
import { useState } from 'react';
import { ArrowRightLeft, X, Loader2 } from 'lucide-react';
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
      <div className="relative bg-(--surface) border border-(--border-color) rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-(--border-color)">
          <div>
            <h3 className="text-lg font-bold text-(--text-primary) flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-(--tone-violet-text-500)" />
              Solicitar Reasignación
            </h3>
            <p className="text-xs text-(--text-secondary) mt-0.5">
              Ticket: <span className="font-mono text-(--tone-amber-text-600) font-semibold">{incident.id}</span> — {incident.title}
            </p>
          </div>
          <Button variant="cancel" appearance="soft" size="custom"
            onClick={handleClose}
            aria-label="Cerrar modal"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Info de contexto */}
          <div className="bg-(--tone-violet-bg-50) p-3.5 rounded-xl border border-(--tone-violet-border-200) text-xs space-y-1">
            <p>
              <strong className="text-(--text-secondary)">Categoría:</strong>{' '}
              <span className="text-(--text-primary) font-semibold">{incident.category}</span>
            </p>
            <p>
              <strong className="text-(--text-secondary)">Especialidad:</strong>{' '}
              <span className="text-(--tone-violet-text-600) font-semibold">{incident.especialidad || 'General'}</span>
            </p>
            <p>
              <strong className="text-(--text-secondary)">Ubicación:</strong>{' '}
              <span className="text-(--text-primary) font-semibold">{incident.location}</span>
            </p>
          </div>

          {/* Aviso */}
          <div className="bg-(--tone-amber-bg-50) border border-(--tone-amber-border-200) rounded-xl p-3 text-xs text-(--tone-amber-text-800)">
            <strong>Nota:</strong> Al solicitar reasignación, un técnico de soporte o administrador
            revisará tu solicitud y decidirá si aprueba o rechaza la reasignación.
          </div>

          {success ? (
            <div className="text-(--tone-emerald-text-600) text-sm bg-(--tone-emerald-bg-50) border border-(--tone-emerald-border-200) rounded-xl px-4 py-4 text-center font-semibold">
              ✅ Solicitud enviada correctamente. El administrador será notificado.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-(--text-secondary) mb-1.5">
                  Motivo de la reasignación *
                </label>
                <textarea
                  rows={4}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Explica por qué necesitas ser reasignado de esta incidencia. Ej: No cuento con la especialidad requerida, necesito herramientas específicas, etc."
                  className="w-full bg-(--surface) border border-(--border-color) rounded-xl px-4 py-2.5 text-sm text-(--text-primary) placeholder:text-(--text-secondary) focus:outline-none focus:border-violet-500 transition-colors resize-none"
                  required
                />
              </div>

              {error && (
                <div className="text-(--tone-red-text-600) text-sm bg-(--tone-red-bg-50) border border-(--tone-red-border-200) rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-(--border-color)">
                <Button variant="cancel" appearance="soft" size="custom"
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancelar
                </Button>
                <Button variant="assignment" appearance="solid" size="custom"
                  type="submit"
                  disabled={loading || !motivo.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ArrowRightLeft className="w-4 h-4" />
                      Enviar Solicitud
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
