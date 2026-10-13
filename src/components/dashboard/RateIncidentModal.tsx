import { useState } from 'react';
import { Star, X, MessageSquare, Send, AlertCircle, ThumbsUp } from 'lucide-react';
import type { Incident } from '../../types/incident';
import { calificarIncidencia } from '../../services/incidenciasService';

interface RateIncidentModalProps {
  isOpen: boolean;
  incident: Incident | null;
  onClose: () => void;
  onRated: () => void;
}

const STAR_LABELS = ['Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];

const MOTIVOS_BAJA_CALIFICACION = [
  'Problema no solucionado',
  'Demasiado tiempo de espera',
  'Mala atención o trato',
  'Falta de comunicación',
  'Solución incompleta',
  'Otro motivo',
];

const MOTIVOS_POSITIVOS = [
  'Atención rápida y eficaz',
  'Excelente trato del técnico',
  'Problema 100% resuelto',
  'Buena comunicación',
];

export default function RateIncidentModal({ isOpen, incident, onClose, onRated }: RateIncidentModalProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [selectedMotivo, setSelectedMotivo] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !incident) return null;

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    setError(null);
    setSelectedMotivo('');
  };

  const handleClose = () => {
    setRating(0);
    setHovered(0);
    setSelectedMotivo('');
    setComment('');
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Debes seleccionar una calificación en estrellas');
      return;
    }

    // Exigir justificación en calificaciones bajas (<= 2) para retroalimentación operativa
    if (rating <= 2 && !selectedMotivo && !comment.trim()) {
      setError('Por favor selecciona un motivo o escribe un comentario para saber qué falló');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await calificarIncidencia(
        incident.numericId!,
        rating,
        selectedMotivo || undefined,
        comment.trim() || undefined
      );
      setRating(0);
      setSelectedMotivo('');
      setComment('');
      onRated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al enviar la calificación');
    } finally {
      setSubmitting(false);
    }
  };

  const activeRating = hovered || rating;
  const isNegative = rating > 0 && rating <= 2;
  const isNeutral = rating === 3;
  const isPositive = rating >= 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className={`px-6 py-5 border-b border-slate-200 transition-colors ${
          isNegative ? 'bg-gradient-to-r from-red-50 to-orange-50' : 'bg-gradient-to-r from-amber-50 to-orange-50'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-600 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-200">
                  {incident.id}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1.5">Calificar Atención</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tu opinión nos ayuda a medir y mejorar la calidad de soporte universitario
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-xl bg-white/80 hover:bg-white text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-slate-200"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Incident title */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Incidencia</p>
            <p className="text-sm text-slate-800 font-medium mt-0.5">{incident.title}</p>
          </div>

          {/* Star Rating */}
          <div className="text-center">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Tu calificación</p>
            <div className="flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="p-1 transition-transform hover:scale-110 cursor-pointer"
                  title={STAR_LABELS[star - 1]}
                >
                  <Star
                    className={`w-9 h-9 transition-colors duration-150 ${
                      star <= activeRating
                        ? activeRating <= 2
                          ? 'fill-red-400 text-red-400'
                          : activeRating === 3
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-emerald-400 text-emerald-400'
                        : 'fill-transparent text-slate-300 hover:text-amber-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {activeRating > 0 && (
              <p className={`mt-2 text-sm font-semibold transition-colors ${
                activeRating <= 2 ? 'text-red-500' : activeRating === 3 ? 'text-amber-500' : 'text-emerald-600'
              }`}>
                {STAR_LABELS[activeRating - 1]}
              </p>
            )}
          </div>

          {/* Motivos condicionales para calificación baja / regular */}
          {(isNegative || isNeutral) && (
            <div className="p-4 bg-red-50/60 border border-red-200/80 rounded-xl space-y-2.5 transition-all">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  ¿Cuál fue el motivo principal? {isNegative && <span className="text-red-600 font-semibold">*</span>}
                </span>
              </div>
              <p className="text-xs text-red-700/80">
                Selecciona la razón para que el equipo pueda auditar el caso:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {MOTIVOS_BAJA_CALIFICACION.map((motivo) => {
                  const isSelected = selectedMotivo === motivo;
                  return (
                    <button
                      key={motivo}
                      type="button"
                      onClick={() => setSelectedMotivo(isSelected ? '' : motivo)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-red-600 text-white border-red-600 shadow-sm'
                          : 'bg-white text-slate-700 border-red-200 hover:border-red-300 hover:bg-red-50/50'
                      }`}
                    >
                      {motivo}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Motivos positivos opcionales */}
          {isPositive && (
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-2 transition-all">
              <div className="flex items-center gap-2 text-emerald-800">
                <ThumbsUp className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider">¿Qué destacó positivamente?</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {MOTIVOS_POSITIVOS.map((motivo) => {
                  const isSelected = selectedMotivo === motivo;
                  return (
                    <button
                      key={motivo}
                      type="button"
                      onClick={() => setSelectedMotivo(isSelected ? '' : motivo)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white text-slate-700 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                      }`}
                    >
                      {motivo}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Comment */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <MessageSquare className="w-3.5 h-3.5" />
              {isNegative ? 'Comentario adicional' : 'Comentario (opcional)'}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder={
                isNegative
                  ? 'Cuéntanos qué sucedió con más detalle para investigar qué ocurrió...'
                  : isPositive
                    ? '¿Tienes algún mensaje de agradecimiento o felicitación para el técnico?'
                    : 'Cuéntanos tu experiencia con la atención recibida...'
              }
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 resize-none transition-all"
            />
            <p className="text-right text-[10px] text-slate-400 mt-1">{comment.length}/500</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed ${
              isNegative
                ? 'bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white'
                : 'bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white'
            }`}
          >
            {submitting ? (
              <span className="animate-spin w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{submitting ? 'Enviando...' : 'Enviar Calificación'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

