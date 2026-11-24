import Button from '../Button';
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

      <div className="relative bg-(--surface) rounded-2xl shadow-2xl border border-(--border-color) w-full max-w-lg overflow-hidden z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className={`px-6 py-5 border-b border-(--border-color) transition-colors ${
          isNegative ? 'bg-gradient-to-r from-(--tone-red-bg-50) to-(--tone-orange-bg-50)' : 'bg-gradient-to-r from-(--tone-amber-bg-50) to-(--tone-orange-bg-50)'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-(--tone-amber-text-600) bg-(--tone-amber-bg-100) px-2.5 py-0.5 rounded-lg border border-(--tone-amber-border-200)">
                  {incident.id}
                </span>
              </div>
              <h3 className="text-base font-bold text-(--text-primary) mt-1.5">Calificar Atención</h3>
              <p className="text-xs text-(--text-secondary) mt-0.5">
                Tu opinión nos ayuda a medir y mejorar la calidad de soporte universitario
              </p>
            </div>
            <Button variant="cancel" appearance="soft" size="custom"
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 border"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Incident title */}
          <div className="bg-(--surface-subtle) border border-(--border-color)/70 rounded-xl p-3">
            <p className="text-xs text-(--text-secondary) font-semibold uppercase tracking-wider">Incidencia</p>
            <p className="text-sm text-(--text-primary) font-medium mt-0.5">{incident.title}</p>
          </div>

          {/* Star Rating */}
          <div className="text-center">
            <p className="text-xs font-bold text-(--text-secondary) uppercase tracking-wider mb-3">Tu calificación</p>
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
                          ? 'fill-red-400 text-(--tone-red-text-400)'
                          : activeRating === 3
                            ? 'fill-amber-400 text-(--tone-amber-text-400)'
                            : 'fill-emerald-400 text-(--tone-emerald-text-400)'
                        : 'fill-transparent text-(--text-secondary) hover:text-(--tone-amber-text-300)'
                    }`}
                  />
                </button>
              ))}
            </div>
            {activeRating > 0 && (
              <p className={`mt-2 text-sm font-semibold transition-colors ${
                activeRating <= 2 ? 'text-(--tone-red-text-500)' : activeRating === 3 ? 'text-(--tone-amber-text-500)' : 'text-(--tone-emerald-text-600)'
              }`}>
                {STAR_LABELS[activeRating - 1]}
              </p>
            )}
          </div>

          {/* Motivos condicionales para calificación baja / regular */}
          {(isNegative || isNeutral) && (
            <div className="p-4 bg-(--tone-red-bg-50)/60 border border-(--tone-red-border-200)/80 rounded-xl space-y-2.5 transition-all">
              <div className="flex items-center gap-2 text-(--tone-red-text-800)">
                <AlertCircle className="w-4 h-4 shrink-0 text-(--tone-red-text-500)" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  ¿Cuál fue el motivo principal? {isNegative && <span className="text-(--tone-red-text-600) font-semibold">*</span>}
                </span>
              </div>
              <p className="text-xs text-(--tone-red-text-700)/80">
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
                          : 'bg-(--surface) text-(--text-primary) border-(--tone-red-border-200) hover:border-(--tone-red-border-300) hover:bg-(--tone-red-bg-50)/50'
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
            <div className="p-3.5 bg-(--tone-emerald-bg-50)/60 border border-(--tone-emerald-border-200)/80 rounded-xl space-y-2 transition-all">
              <div className="flex items-center gap-2 text-(--tone-emerald-text-800)">
                <ThumbsUp className="w-3.5 h-3.5 shrink-0 text-(--tone-emerald-text-600)" />
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
                          : 'bg-(--surface) text-(--text-primary) border-(--tone-emerald-border-200) hover:border-(--tone-emerald-border-300) hover:bg-(--tone-emerald-bg-50)/50'
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
            <label className="flex items-center gap-1.5 text-xs font-bold text-(--text-secondary) uppercase tracking-wider mb-2">
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
              className="w-full px-4 py-3 bg-(--surface-subtle) border border-(--border-color) rounded-xl text-sm text-(--text-primary) placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 resize-none transition-all"
            />
            <p className="text-right text-[10px] text-(--text-secondary) mt-1">{comment.length}/500</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-(--tone-red-bg-50) border border-(--tone-red-border-200) text-(--tone-red-text-700) rounded-xl px-4 py-2.5 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-(--surface-subtle) border-t border-(--border-color) flex items-center justify-end gap-3 shrink-0">
          <Button variant="cancel" appearance="soft" size="custom"
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="px-4 py-2 text-xs font-bold border rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </Button>
          <Button variant="info" appearance="solid" size="custom"
            type="button"
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="animate-spin w-3.5 h-3.5 border-2 border-(--border-color)/30 border-t-white rounded-full" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{submitting ? 'Enviando...' : 'Enviar Calificación'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

