import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faSpinner, faUserCheck } from '@fortawesome/free-solid-svg-icons';
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
          // Preselect matching specialty if available
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
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FontAwesomeIcon icon={faUserCheck} className="text-amber-400" />
              Asignar Técnico
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ticket: <span className="font-mono text-amber-400">{incident.id}</span> — {incident.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 text-xs text-slate-300 space-y-1">
            <p>
              <strong className="text-white">Categoría:</strong> {incident.category}
            </p>
            <p>
              <strong className="text-white">Especialidad requerida:</strong>{' '}
              <span className="text-amber-300 font-semibold">{incident.especialidad || 'General'}</span>
            </p>
            <p>
              <strong className="text-white">Ubicación:</strong> {incident.location}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Seleccionar técnico disponible
            </label>

            {fetching ? (
              <div className="text-center py-6 text-slate-400">
                <FontAwesomeIcon icon={faSpinner} spin className="text-xl" />
                <p className="text-xs mt-2">Cargando técnicos...</p>
              </div>
            ) : tecnicos.length === 0 ? (
              <div className="text-sm text-slate-400 bg-slate-800 p-4 rounded-xl text-center">
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
                          ? 'bg-amber-500/10 border-amber-500/50 text-white'
                          : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                          {t.nombre.charAt(0)}
                          {t.apellido.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {t.nombre} {t.apellido}
                          </p>
                          <p className="text-xs text-slate-400">
                            {t.especialidad || 'Sin especialidad'}
                            {isMatch && (
                              <span className="ml-2 text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-semibold">
                                Recomendado
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono px-2 py-1 rounded-md bg-slate-700/50 text-slate-300">
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
            <div className="text-red-400 text-sm bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAssign}
              disabled={loading || !selectedTecnicoId}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-slate-950 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Asignar Técnico'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
