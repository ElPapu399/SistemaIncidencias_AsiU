import Button from '../Button';
import { useState, useEffect } from 'react';
import { UserCheck, X, Loader2 } from 'lucide-react';
import type { Incident, Tecnico } from '../../types/incident';
import {
  asignarTecnico,
  obtenerTecnicosPorEspecialidad,
} from '../../services/incidenciasService';

interface AssignTechnicianModalProps {
  isOpen: boolean;
  incident: Incident | null;
  onClose: () => void;
  onAssigned: () => void;
}

export default function AssignTechnicianModal({
  isOpen,
  incident,
  onClose,
  onAssigned,
}: AssignTechnicianModalProps) {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [selectedTecnicoId, setSelectedTecnicoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !incident) return;

    setError('');
    setSelectedTecnicoId(incident.assigneeId || null);
    setFetching(true);

    obtenerTecnicosPorEspecialidad()
      .then((data) => {
        setTecnicos(data);
        if (!incident.assigneeId && data.length > 0) {
          const matching = data.find((t) => t.especialidad === incident.especialidad);
          if (matching) {
            setSelectedTecnicoId(matching.id);
          }
        }
      })
      .catch((err) => {
        console.error(err);
        setError('No se pudieron cargar los técnicos.');
      })
      .finally(() => {
        setFetching(false);
      });
  }, [isOpen, incident]);

  const handleAssign = async () => {
    if (!incident || !incident.numericId || !selectedTecnicoId) {
      setError('Selecciona un técnico para asignar.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await asignarTecnico(incident.numericId, selectedTecnicoId);
      onAssigned();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al asignar técnico.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !incident) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-(--surface) border border-(--border-color) rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-(--border-color)">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-(--text-primary) flex items-center gap-2">
              <UserCheck className="w-5 h-5 shrink-0 text-(--tone-amber-text-500)" />
              Asignar Técnico
            </h3>
            <p className="text-xs text-(--text-secondary) mt-0.5 wrap-anywhere">
              Ticket: <span className="font-mono text-(--tone-amber-text-600) font-semibold">{incident.id}</span> — {incident.title}
            </p>
          </div>
          <Button variant="cancel" appearance="soft" size="custom"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="bg-(--surface-muted) p-3.5 rounded-xl border border-(--border-color) text-xs text-(--text-secondary) space-y-1">
            <p>
              <strong className="text-(--text-secondary)">Categoría:</strong>{' '}
              <span className="text-(--text-primary) font-semibold">{incident.category}</span>
            </p>
            <p>
              <strong className="text-(--text-secondary)">Especialidad requerida:</strong>{' '}
              <span className="text-(--tone-amber-text-500) font-semibold">{incident.especialidad || 'General'}</span>
            </p>
            <p>
              <strong className="text-(--text-secondary)">Ubicación:</strong> {' '}
              <span className="text-(--text-primary) font-semibold">{incident.location}</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-(--text-secondary) mb-2">
              Seleccionar técnico disponible
            </label>

            {fetching ? (
              <div className="text-center py-6 text-(--text-secondary)">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-(--tone-amber-text-500)" />
                <p className="text-xs mt-2">Cargando técnicos...</p>
              </div>
            ) : tecnicos.length === 0 ? (
              <div className="text-sm text-(--text-secondary) bg-(--surface-muted) p-4 rounded-xl text-center">
                No hay técnicos registrados en el sistema.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {tecnicos.map((t) => {
                  const isMatch = t.especialidad === incident.especialidad;
                  const isSelected = selectedTecnicoId === t.id;

                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTecnicoId(t.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-(--tone-amber-bg-100) border-(--tone-amber-border-300)'
                          : 'bg-(--surface-subtle) border-(--border-color) hover:bg-(--surface-hover)'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                          {t.nombre.charAt(0)}
                          {t.apellido.charAt(0)}
                        </div>
                        <div>
                          <p className={`text-(--text-primary) transition-all ${
                            isSelected
                              ? 'text-base font-bold'
                              : 'text-sm'
                          }`}
                          >
                            {t.nombre} {t.apellido}
                          </p>
                          <p className={`text-(--text-primary) transition-all ${
                            isSelected
                              ? 'text-[14px] font-bold'
                              : 'text-xs'
                          }`}>
                            {t.especialidad || 'Sin especialidad'}
                            {isMatch && (
                              <span className={`ml-2 px-2 py-0.5 text-(--tone-emerald-text-700) bg-(--tone-emerald-bg-100) rounded-md font-semibold ${
                                isSelected
                                 ? 'text-[12px]'
                                 : 'text-[10px]'
                              }`}
                              >
                                Recomendado
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono px-2 py-1 rounded-md bg-(--surface-muted) text-(--text-secondary)">
                          {t.incidenciasActivas} activa{t.incidenciasActivas !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {error && (
            <div className="text-(--tone-red-text-700) text-sm bg-(--tone-red-bg-50) border border-(--tone-red-border-200) rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-(--border-color)">
            <Button variant="assignment" appearance="solid" size="custom"
              type="button"
              onClick={handleAssign}
              disabled={loading || !selectedTecnicoId}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Asignar Técnico'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
