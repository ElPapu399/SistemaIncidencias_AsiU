import Button from '../Button';
import { useState, useEffect } from 'react';
import {
  ArrowRightLeft,
  X,
  AlertCircle,
  Loader2,
  Check,
  Clock,
  Ban,
  UserCheck,
} from 'lucide-react';
import type { Tecnico } from '../../types/incident';
import {
  type SolicitudReasignacion,
  obtenerSolicitudesPendientes,
  responderSolicitud,
  obtenerTecnicosPorEspecialidad,
} from '../../services/incidenciasService';
import { formatDate, StatusBadge } from './IncidentBadges';

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
      <div className="relative bg-(--surface) border border-(--border-color) rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-(--border-color) bg-(--surface-subtle) shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-(--tone-violet-bg-100) border border-(--tone-violet-border-200) flex items-center justify-center text-(--tone-violet-text-700)">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-(--text-primary) leading-tight">
                Solicitudes de Reasignación Pendientes
              </h3>
              <p className="text-xs text-(--text-secondary) mt-0.5">
                Revisa y resuelve las solicitudes enviadas por los técnicos especialistas.
              </p>
            </div>
          </div>
          <Button variant="cancel" appearance="soft" size="custom"
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Mensaje de éxito flotante / cabecera */}
        {successMsg && (
          <div className="px-6 py-2.5 bg-(--tone-emerald-bg-50) border-b border-(--tone-emerald-border-200) text-(--tone-emerald-text-800) text-xs font-semibold flex items-center gap-2">
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error general */}
        {error && (
          <div className="px-6 py-2.5 bg-(--tone-red-bg-50) border-b border-(--tone-red-border-200) text-(--tone-red-text-700) text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-16 text-center text-(--text-secondary) space-y-2">
              <Loader2 className="w-7 h-7 animate-spin text-(--tone-violet-text-600) mx-auto" />
              <p className="text-xs">Cargando solicitudes pendientes...</p>
            </div>
          ) : solicitudes.length === 0 ? (
            <div className="py-16 text-center text-(--text-secondary) space-y-2">
              <div className="w-12 h-12 rounded-full bg-(--tone-emerald-bg-50) text-(--tone-emerald-text-600) mx-auto flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-(--text-primary)">
                ¡No hay solicitudes pendientes!
              </p>
              <p className="text-xs text-(--text-secondary)">
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
                  className="border border-(--border-color) rounded-xl bg-(--surface) p-4 shadow-xs hover:border-(--border-color) transition-all space-y-3"
                >
                  {/* Top: Ticket & Solicitante */}
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-(--border-color) pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-(--tone-amber-text-600) bg-(--tone-amber-bg-50) px-2 py-0.5 rounded border border-(--tone-amber-border-200)">
                          {sol.codigoTicket}
                        </span>
                        <h4 className="text-sm font-bold text-(--text-primary)">{sol.tituloIncidencia}</h4>
                      </div>
                      <div className="text-xs text-(--text-secondary) mt-1 flex items-center gap-2">
                        <span>
                          Solicitado por: <strong className="text-(--text-primary)">{sol.tecnicoSolicitanteNombre}</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-(--text-secondary)">
                          <Clock className="w-3 h-3 text-(--text-secondary)" />
                          {formatDate(sol.fechaSolicitud)}
                        </span>
                      </div>
                    </div>

                    <StatusBadge status="Pendiente" />
                  </div>

                  {/* Motivo escrito por el técnico */}
                  <div className="bg-(--surface-subtle) border border-(--border-color) rounded-lg p-3 text-xs">
                    <p className="text-(--text-secondary) font-semibold uppercase tracking-wider text-[10px] mb-1">
                      Motivo de la solicitud:
                    </p>
                    <p className="text-(--text-primary) italic leading-relaxed whitespace-pre-wrap">
                      "{sol.motivo}"
                    </p>
                  </div>

                  {/* Panel de decisión / formulario */}
                  {isCurrentAction ? (
                    <div
                      className={`p-4 rounded-xl border space-y-3 transition-all ${
                        activeAction.type === 'APROBAR'
                          ? 'bg-(--tone-violet-bg-50)/60 border-(--tone-violet-border-200)'
                          : 'bg-(--tone-rose-bg-50)/60 border-(--tone-rose-border-200)'
                      }`}
                    >
                      <h5 className="text-xs font-bold uppercase tracking-wider text-(--text-primary) flex items-center gap-2">
                        {activeAction.type === 'APROBAR' ? (
                          <>
                            <Check className="w-4 h-4 text-(--tone-violet-text-600)" />
                            Aprobar solicitud y reasignar incidencia
                          </>
                        ) : (
                          <>
                            <Ban className="w-4 h-4 text-(--tone-rose-text-600)" />
                            Rechazar solicitud de reasignación
                          </>
                        )}
                      </h5>

                      {activeAction.type === 'APROBAR' && (
                        <div>
                          <label className="block text-xs font-semibold text-(--text-primary) mb-1">
                            Seleccionar nuevo técnico especialista *
                          </label>
                          <select
                            value={selectedTecnicoId ?? ''}
                            onChange={(e) => setSelectedTecnicoId(Number(e.target.value))}
                            className="w-full bg-(--surface) border border-(--border-color) rounded-xl px-3 py-2 text-xs font-medium text-(--text-primary) focus:outline-none focus:border-violet-500"
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
                        <label className="block text-xs font-semibold text-(--text-primary) mb-1">
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
                          className="w-full bg-(--surface) border border-(--border-color) rounded-xl px-3 py-2 text-xs text-(--text-primary) placeholder:text-(--text-secondary) focus:outline-none focus:border-violet-500"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <Button variant="cancel" appearance="soft" size="custom"
                          type="button"
                          disabled={isProcessing}
                          onClick={handleCancelAction}
                          className="px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors cursor-pointer"
                        >
                          Cancelar
                        </Button>
                        <Button variant={activeAction.type === 'APROBAR' ? 'assignment' : 'danger'} appearance="solid" size="custom"
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleConfirmAction(sol)}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : activeAction.type === 'APROBAR' ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Confirmar y Reasignar
                            </>
                          ) : (
                            <>
                              <Ban className="w-3.5 h-3.5" />
                              Confirmar Rechazo
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Botones iniciales: Aprobar o Rechazar */
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button variant="danger" appearance="solid" size="custom"
                        type="button"
                        onClick={() => handleStartRechazar(sol)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Rechazar</span>
                      </Button>
                      <Button variant="assignment" appearance="solid" size="custom"
                        type="button"
                        onClick={() => handleStartAprobar(sol)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors shadow-xs cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Aprobar y Reasignar</span>
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-(--surface-subtle) border-t border-(--border-color) flex items-center justify-between text-xs text-(--text-secondary) shrink-0">
          <span>
            {solicitudes.length} solicitud{solicitudes.length !== 1 ? 'es' : ''} pendiente{solicitudes.length !== 1 ? 's' : ''}
          </span>
          <Button variant="cancel" appearance="soft" size="custom"
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium border rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
