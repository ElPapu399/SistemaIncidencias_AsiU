import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark,
  faSpinner,
  faCheck,
  faBan,
  faUserGear,
  faClock,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { ArrowRightLeft } from 'lucide-react';
import type { Tecnico } from '../../types/incident';
import {
  type SolicitudReasignacion,
  obtenerSolicitudesPendientes,
  responderSolicitud,
  obtenerTecnicosPorEspecialidad,
} from '../../services/incidenciasService';
import { formatDate } from './IncidentBadges';

interface ManageReassignmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProcessed: () => void;
}

export default function ManageReassignmentsModal({
  isOpen,
  onClose,
  onProcessed,
}: ManageReassignmentsModalProps) {
  const [solicitudes, setSolicitudes] = useState<SolicitudReasignacion[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Acción activa por solicitud: id de la solicitud y si está en modo 'aprobar' o 'rechazar'
  const [activeAction, setActiveAction] = useState<{
    solicitudId: number;
    type: 'APROBAR' | 'RECHAZAR';
  } | null>(null);

  const [selectedTecnicoId, setSelectedTecnicoId] = useState<number | null>(null);
  const [comentario, setComentario] = useState('');

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      const [sols, tecs] = await Promise.all([
        obtenerSolicitudesPendientes(),
        obtenerTecnicosPorEspecialidad(),
      ]);
      setSolicitudes(sols);
      setTecnicos(tecs);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las solicitudes de reasignación');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setActiveAction(null);
      setSelectedTecnicoId(null);
      setComentario('');
      setSuccessMsg('');
      cargarDatos();
    }
  }, [isOpen]);

  const handleStartAprobar = (solicitud: SolicitudReasignacion) => {
    setActiveAction({ solicitudId: solicitud.id, type: 'APROBAR' });
    setComentario('');
    // Sugerir un técnico diferente al que solicita
    const candidatos = tecnicos.filter((t) => t.id !== solicitud.tecnicoSolicitanteId);
    setSelectedTecnicoId(candidatos.length > 0 ? candidatos[0].id : null);
    setError('');
  };

  const handleStartRechazar = (solicitud: SolicitudReasignacion) => {
    setActiveAction({ solicitudId: solicitud.id, type: 'RECHAZAR' });
    setSelectedTecnicoId(null);
    setComentario('');
    setError('');
  };

  const handleCancelAction = () => {
    setActiveAction(null);
    setSelectedTecnicoId(null);
    setComentario('');
  };

  const handleConfirmAction = async (solicitud: SolicitudReasignacion) => {
    if (!activeAction) return;

    if (activeAction.type === 'APROBAR') {
      if (!selectedTecnicoId) {
        setError('Debes seleccionar al nuevo técnico especialista para reasignar.');
        return;
      }
      if (selectedTecnicoId === solicitud.tecnicoSolicitanteId) {
        setError('Debes seleccionar un técnico diferente al solicitante.');
        return;
      }
    }

    setProcessingId(solicitud.id);
    setError('');

    try {
      const decision = activeAction.type === 'APROBAR' ? 'APROBADA' : 'RECHAZADA';
      await responderSolicitud(
        solicitud.id,
        decision,
        comentario.trim() || undefined,
        activeAction.type === 'APROBAR' ? selectedTecnicoId ?? undefined : undefined
      );

      setSuccessMsg(
        activeAction.type === 'APROBAR'
          ? `✅ Solicitud de ${solicitud.codigoTicket} aprobada y reasignada con éxito.`
          : `ℹ️ Solicitud de ${solicitud.codigoTicket} rechazada.`
      );

      setActiveAction(null);
      setComentario('');
      setSelectedTecnicoId(null);

      // Recargar solicitudes y notificar al padre
      await cargarDatos();
      onProcessed();

      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud.');
    } finally {
      setProcessingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                Solicitudes de Reasignación Pendientes
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Revisa y resuelve las solicitudes enviadas por los técnicos especialistas.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Mensaje de éxito flotante / cabecera */}
        {successMsg && (
          <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error general */}
        {error && (
          <div className="px-6 py-2.5 bg-red-50 border-b border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
            <FontAwesomeIcon icon={faCircleExclamation} />
            <span>{error}</span>
          </div>
        )}

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <FontAwesomeIcon icon={faSpinner} spin className="text-2xl text-violet-600" />
              <p className="text-xs">Cargando solicitudes pendientes...</p>
            </div>
          ) : solicitudes.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <FontAwesomeIcon icon={faCheck} className="text-xl" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                ¡No hay solicitudes pendientes!
              </p>
              <p className="text-xs text-slate-500">
                Todos los técnicos están asignados correctamente y no hay solicitudes por revisar.
              </p>
            </div>
          ) : (
            solicitudes.map((sol) => {
              const isCurrentAction = activeAction?.solicitudId === sol.id;
              const isProcessing = processingId === sol.id;

              return (
                <div
                  key={sol.id}
                  className="border border-slate-200 rounded-xl bg-white p-4 shadow-xs hover:border-slate-300 transition-all space-y-3"
                >
                  {/* Top: Ticket & Solicitante */}
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {sol.codigoTicket}
                        </span>
                        <h4 className="text-sm font-bold text-slate-800">{sol.tituloIncidencia}</h4>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <span>
                          Solicitado por: <strong className="text-slate-700">{sol.tecnicoSolicitanteNombre}</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <FontAwesomeIcon icon={faClock} className="text-[10px]" />
                          {formatDate(sol.fechaSolicitud)}
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 bg-amber-100 border border-amber-300 text-amber-800 text-[11px] font-bold rounded-full">
                      Pendiente
                    </span>
                  </div>

                  {/* Motivo escrito por el técnico */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
                    <p className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] mb-1">
                      Motivo de la solicitud:
                    </p>
                    <p className="text-slate-800 italic leading-relaxed whitespace-pre-wrap">
                      "{sol.motivo}"
                    </p>
                  </div>

                  {/* Panel de decisión / formulario */}
                  {isCurrentAction ? (
                    <div
                      className={`p-4 rounded-xl border space-y-3 transition-all ${
                        activeAction.type === 'APROBAR'
                          ? 'bg-violet-50/60 border-violet-200'
                          : 'bg-rose-50/60 border-rose-200'
                      }`}
                    >
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                        {activeAction.type === 'APROBAR' ? (
                          <>
                            <FontAwesomeIcon icon={faCheck} className="text-violet-600" />
                            Aprobar solicitud y reasignar incidencia
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faBan} className="text-rose-600" />
                            Rechazar solicitud de reasignación
                          </>
                        )}
                      </h5>

                      {activeAction.type === 'APROBAR' && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Seleccionar nuevo técnico especialista *
                          </label>
                          <select
                            value={selectedTecnicoId ?? ''}
                            onChange={(e) => setSelectedTecnicoId(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-violet-500"
                          >
                            <option value="">-- Selecciona un técnico --</option>
                            {tecnicos
                              .filter((t) => t.id !== sol.tecnicoSolicitanteId)
                              .map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.nombre} {t.apellido} — {t.especialidad || 'General'} ({t.incidenciasActivas} activas)
                                </option>
                              ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {activeAction.type === 'APROBAR'
                            ? 'Comentario u observación (opcional)'
                            : 'Motivo del rechazo (opcional pero recomendado)'}
                        </label>
                        <input
                          type="text"
                          value={comentario}
                          onChange={(e) => setComentario(e.target.value)}
                          placeholder={
                            activeAction.type === 'APROBAR'
                              ? 'Ej: Se transfiere a especialista correspondiente...'
                              : 'Ej: No hay otro especialista disponible actualmente...'
                          }
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-500"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={handleCancelAction}
                          className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleConfirmAction(sol)}
                          className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white rounded-lg transition-all shadow-xs cursor-pointer ${
                            activeAction.type === 'APROBAR'
                              ? 'bg-violet-600 hover:bg-violet-700 shadow-violet-500/20'
                              : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                          }`}
                        >
                          {isProcessing ? (
                            <FontAwesomeIcon icon={faSpinner} spin />
                          ) : activeAction.type === 'APROBAR' ? (
                            <>
                              <FontAwesomeIcon icon={faCheck} />
                              Confirmar y Reasignar
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faBan} />
                              Confirmar Rechazo
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Botones iniciales: Aprobar o Rechazar */
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleStartRechazar(sol)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faBan} className="text-xs" />
                        <span>Rechazar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartAprobar(sol)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 border border-violet-600 transition-colors shadow-xs cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faUserGear} className="text-xs" />
                        <span>Aprobar y Reasignar</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>
            {solicitudes.length} solicitud{solicitudes.length !== 1 ? 'es' : ''} pendiente{solicitudes.length !== 1 ? 's' : ''}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
