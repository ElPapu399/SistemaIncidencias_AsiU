import Button from '../Button';
import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark,
  faSpinner,
  faCheckCircle,
  faClock,
  faCamera,
  faImage,
  faPlus,
  faMagnifyingGlassPlus,
  faArrowUpRightFromSquare,
  faClockRotateLeft,
} from '@fortawesome/free-solid-svg-icons';
import type { Incident, IncidentStatus, ArchivoAdjunto } from '../../types/incident';
import type { EstadoEquipo } from '../../types/equipo';
import {
  cambiarEstado,
  obtenerAdjuntos,
  subirAdjunto,
  getAttachmentUrl,
  obtenerDetalleIncidencia,
} from '../../services/incidenciasService';
import { cambiarEstadoEquipo } from '../../services/laboratoriosService';
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
  const [nuevoEstadoEquipo, setNuevoEstadoEquipo] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [adjuntos, setAdjuntos] = useState<ArchivoAdjunto[]>([]);
  const [loadingAdjuntos, setLoadingAdjuntos] = useState(false);
  const [uploadingAdjunto, setUploadingAdjunto] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ArchivoAdjunto | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [historial, setHistorial] = useState<any[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  useEffect(() => {
    if (!isOpen || !incident) return;
    setError('');
    setNuevoEstado(incident.status);
    setSolucionTecnica(incident.solucionTecnica || '');
    setNuevoEstadoEquipo('');
    setSelectedImage(null);

    if (incident.numericId) {
      setLoadingAdjuntos(true);
      obtenerAdjuntos(incident.numericId)
        .then((data) => {
          setAdjuntos(data);
        })
        .catch((err) => {
          console.warn('Error al cargar adjuntos:', err);
          setAdjuntos([]);
        })
        .finally(() => {
          setLoadingAdjuntos(false);
        });

      setLoadingHistorial(true);
      obtenerDetalleIncidencia(incident.numericId)
        .then((detalle) => {
          setHistorial(detalle.historial || []);
        })
        .catch((err) => {
          console.warn('Error al cargar historial de trazabilidad:', err);
          setHistorial([]);
        })
        .finally(() => {
          setLoadingHistorial(false);
        });
    } else {
      setAdjuntos([]);
      setHistorial([]);
    }
  }, [isOpen, incident]);

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !incident?.numericId) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen no debe superar los 10 MB.');
      return;
    }

    setUploadingAdjunto(true);
    setError('');

    try {
      const nuevo = await subirAdjunto(incident.numericId, file);
      setAdjuntos((prev) => [nuevo, ...prev]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.message || 'Error al subir la imagen.');
    } finally {
      setUploadingAdjunto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident || !incident.numericId) return;

    const isResolving = nuevoEstado === 'Resuelta' || nuevoEstado === 'Resuelto';
    if (isResolving && !solucionTecnica.trim()) {
      setError('La solución técnica es obligatoria para marcar como Resuelta.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await cambiarEstado(
        incident.numericId,
        nuevoEstado,
        isResolving ? solucionTecnica.trim() : undefined
      );

      if (incident.equipoId && nuevoEstadoEquipo) {
        try {
          await cambiarEstadoEquipo(incident.equipoId, {
            estado: nuevoEstadoEquipo as EstadoEquipo,
            motivo: `Ticket ${incident.id} (${nuevoEstado})${solucionTecnica.trim() ? ': ' + solucionTecnica.trim() : ''}`,
          });
        } catch (eqErr: any) {
          console.warn('No se pudo actualizar el estado del equipo:', eqErr);
        }
      }

      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el estado.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !incident) return null;

  const canEdit =
    currentUserRole === 'ADMIN' ||
    currentUserRole === 'TECNICO' ||
    currentUserRole === 'TECNICO_GENERAL' ||
    currentUserRole === 'TECNICO_ESPECIALISTA';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

        {/* Modal Card */}
        <div className="relative bg-(--surface) border border-(--border-color) rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden z-10">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-(--border-color)">
            <div>
              <span className="text-xs font-mono text-(--tone-amber-text-600) font-semibold">{incident.id}</span>
              <h3 className="text-lg font-bold text-(--text-primary) leading-tight mt-0.5">{incident.title}</h3>
            </div>
            <Button variant="cancel" appearance="soft" size="custom"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            >
              <FontAwesomeIcon icon={faXmark} />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
            {/* Badges & Meta */}
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-(--border-color)">
              <StatusBadge status={incident.status} />
              <PriorityBadge priority={incident.priority} />
              <span className="text-xs text-(--text-secondary) ml-auto flex items-center gap-1.5">
                <FontAwesomeIcon icon={faClock} />
                {formatDate(incident.createdAt)}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-(--surface-muted) p-4 rounded-xl border border-(--border-color)">
              <div>
                <span className="text-(--text-secondary) uppercase tracking-wider block font-semibold">Reportado por</span>
                <span className="text-(--text-primary) font-medium">{incident.reporter}</span>
              </div>
              <div>
                <span className="text-(--text-secondary) uppercase tracking-wider block font-semibold">Técnico Asignado</span>
                <span className="text-(--text-primary) font-medium">{incident.assignee}</span>
              </div>
              <div>
                <span className="text-(--text-secondary) uppercase tracking-wider block font-semibold">Ubicación</span>
                <span className="text-(--text-primary) font-medium">{incident.location}</span>
              </div>
              <div>
                <span className="text-(--text-secondary) uppercase tracking-wider block font-semibold">Categoría</span>
                <span className="text-(--text-primary) font-medium">
                  {incident.category} {incident.especialidad ? `(${incident.especialidad})` : ''}
                </span>
              </div>
            </div>

            {/* Equipo Afectado (si aplica) */}
            {incident.equipoCodigo && (
              <div className="p-3 bg-(--surface-subtle) border border-(--border-color) rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-base">💻</span>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-(--text-secondary) block">
                      Equipo Afectado
                    </span>
                    <span className="font-semibold text-(--text-primary)">
                      {incident.equipoCodigo}
                    </span>
                    <span className="text-(--text-secondary) ml-1.5">
                      ({incident.equipoTipo || 'Equipo'})
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-(--text-secondary) mb-1">
                Descripción
              </label>
              <div className="bg-(--surface-muted) border border-(--border-color) rounded-xl p-3.5 text-sm text-(--text-primary) leading-relaxed whitespace-pre-wrap">
                {incident.description}
              </div>
            </div>

            {/* SECCIÓN DE EVIDENCIA FOTOGRÁFICA / ADJUNTOS */}
            <div className="pt-2 border-t border-(--border-color)">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-(--text-secondary) flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faCamera} className="text-(--tone-amber-text-500)" />
                    Evidencia Fotográfica
                  </label>
                  {adjuntos.length > 0 && (
                    <span className="px-2 py-0.5 bg-(--tone-amber-bg-50) border border-(--tone-amber-border-200) text-(--tone-amber-text-700) text-[10px] font-bold rounded-full">
                      {adjuntos.length} {adjuntos.length === 1 ? 'foto' : 'fotos'}
                    </span>
                  )}
                </div>

                {/* Botón para subir nueva foto */}
                <div>
                  <Button variant="info" appearance="soft" size="custom"
                    type="button"
                    disabled={uploadingAdjunto}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {uploadingAdjunto ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin className=" text-xs" />
                        <span>Subiendo...</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faPlus} className=" text-xs" />
                        <span>Adjuntar foto</span>
                      </>
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                    onChange={handleUploadFile}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Contenedor de fotos */}
              {loadingAdjuntos ? (
                <div className="py-6 text-center text-xs text-(--text-secondary) bg-(--surface-subtle) rounded-xl border border-(--border-color) flex items-center justify-center gap-2">
                  <FontAwesomeIcon icon={faSpinner} spin className="text-(--tone-amber-text-500)" />
                  <span>Cargando fotos de evidencia...</span>
                </div>
              ) : adjuntos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {adjuntos.map((adj) => {
                    const fullUrl = getAttachmentUrl(adj.urlArchivo);
                    return (
                      <div
                        key={adj.id}
                        onClick={() => setSelectedImage(adj)}
                        className="group relative bg-(--surface) border border-(--border-color) hover:border-amber-400 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-black/40"
                      >
                        {/* Thumbnail */}
                        <div className="w-full h-24 sm:h-28 overflow-hidden bg-(--surface-muted) flex items-center justify-center">
                          <img
                            src={fullUrl}
                            alt={adj.nombreOriginal}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white">
                          <FontAwesomeIcon icon={faMagnifyingGlassPlus} className="text-lg text-(--tone-amber-text-400)" />
                          <span className="text-[10px] font-semibold tracking-wider uppercase">Ver grande</span>
                        </div>

                        {/* Caption */}
                        <div className="p-2 bg-(--surface) border-t border-(--border-color)">
                          <p className="text-[11px] font-medium text-(--text-primary) truncate" title={adj.nombreOriginal}>
                            {adj.nombreOriginal}
                          </p>
                          <p className="text-[10px] text-(--text-secondary) mt-0.5">
                            {(adj.tamanioByte / 1024 < 1024
                              ? `${(adj.tamanioByte / 1024).toFixed(0)} KB`
                              : `${(adj.tamanioByte / (1024 * 1024)).toFixed(1)} MB`)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="py-5 px-4 text-center bg-(--surface-subtle) hover:bg-(--surface-muted) border border-dashed border-(--border-color) hover:border-amber-400 rounded-xl cursor-pointer transition-colors"
                >
                  <FontAwesomeIcon icon={faImage} className="text-(--text-secondary) text-lg mb-1 block mx-auto" />
                  <p className="text-xs text-(--text-secondary) font-medium">No hay fotos de evidencia adjuntas</p>
                  <p className="text-[11px] text-(--tone-amber-text-600) mt-0.5 underline decoration-amber-400/30">
                    Haz clic aquí para agregar una foto ahora
                  </p>
                </div>
              )}
            </div>

            {/* SECCIÓN DE TRAZABILIDAD / HISTORIAL DE ACCIONES */}
            <div className="pt-2 border-t border-(--border-color)">
              <div className="flex items-center gap-2 mb-2.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-(--text-secondary) flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faClockRotateLeft} className="text-(--tone-violet-text-500)" />
                  Trazabilidad e Historial de Acciones
                </label>
                {historial.length > 0 && (
                  <span className="px-2 py-0.5 bg-(--tone-violet-bg-50) border border-(--tone-violet-border-200) text-(--tone-violet-text-700) text-[10px] font-bold rounded-full">
                    {historial.length} eventos
                  </span>
                )}
              </div>

              {loadingHistorial ? (
                <div className="py-4 text-center text-xs text-(--text-secondary) bg-(--surface-subtle) rounded-xl border border-(--border-color) flex items-center justify-center gap-2">
                  <FontAwesomeIcon icon={faSpinner} spin className="text-(--tone-violet-text-500)" />
                  <span>Cargando traza de la incidencia...</span>
                </div>
              ) : historial.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {historial.map((item: any, idx: number) => {
                    const isReasignacion = item.tipoAccion === 'REASIGNACION';
                    const isAsignacion = item.tipoAccion === 'ASIGNACION';

                    return (
                      <div
                        key={item.id || idx}
                        className={`p-2.5 rounded-xl border text-xs transition-colors ${
                          isReasignacion
                            ? 'bg-(--tone-violet-bg-50)/70 border-(--tone-violet-border-200) text-(--tone-violet-text-900)'
                            : isAsignacion
                            ? 'bg-(--tone-amber-bg-50)/70 border-(--tone-amber-border-200) text-(--tone-amber-text-900)'
                            : 'bg-(--surface-subtle) border-(--border-color) text-(--text-primary)'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold flex items-center gap-1">
                            {isReasignacion ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />
                                Reasignación de Técnico
                              </>
                            ) : isAsignacion ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                                Asignación Inicial
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 rounded-full bg-(--track-color) inline-block" />
                                Cambio de Estado: {item.estadoAnterior} → {item.estadoNuevo}
                              </>
                            )}
                          </span>
                          <span className="text-(--text-secondary) text-[10px]">
                            {formatDate(item.fechaCambio)}
                          </span>
                        </div>

                        <div className="text-[11px] text-(--text-primary) space-y-0.5">
                          <p>
                            <span className="font-semibold text-(--text-secondary)">Realizado por:</span>{' '}
                            <strong>{item.usuarioNombre || 'Sistema'}</strong>
                          </p>
                          {item.tecnicoAnteriorNombre && item.tecnicoNuevoNombre && (
                            <p className="text-(--tone-violet-text-800) font-medium">
                              De: <span className="line-through">{item.tecnicoAnteriorNombre}</span> → A:{' '}
                              <strong>{item.tecnicoNuevoNombre}</strong>
                            </p>
                          )}
                          {item.comentario && (
                            <p className="text-[10px] text-(--text-secondary) italic bg-(--surface)/70 p-1.5 rounded border border-(--border-color)/50 mt-1 whitespace-pre-wrap">
                              {item.comentario}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-3 px-4 text-center bg-(--surface-subtle) border border-(--border-color) rounded-xl text-xs text-(--text-secondary)">
                  No hay registros en el historial de trazabilidad todavía.
                </div>
              )}
            </div>

            {/* Technical Solution (if resolved or editing) */}
            {incident.solucionTecnica && !canEdit && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-(--tone-emerald-text-600) mb-1 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faCheckCircle} /> Solución Técnica
                </label>
                <div className="bg-(--tone-emerald-bg-50) border border-(--tone-emerald-border-200) rounded-xl p-3.5 text-sm text-(--tone-emerald-text-700)">
                  {incident.solucionTecnica}
                </div>
              </div>
            )}

            {/* Edit section for Admin/Technician */}
            {canEdit && (
              <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-(--border-color)">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-(--text-secondary) mb-1.5">
                    Cambiar estado *
                  </label>
                  <select
                    value={nuevoEstado}
                    onChange={(e) => setNuevoEstado(e.target.value as IncidentStatus)}
                    className="w-full bg-(--surface) border border-(--border-color) rounded-xl px-4 py-2.5 text-sm text-(--text-primary) focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Asignada">Asignada</option>
                    <option value="En atención">En atención (En Proceso)</option>
                    <option value="Resuelta">Resuelta</option>
                    <option value="Cerrada">Cerrada</option>
                  </select>
                </div>

                {incident.equipoId && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-(--text-secondary) mb-1.5">
                      Estado del equipo ({incident.equipoCodigo || 'Máquina'})
                    </label>
                    <select
                      value={nuevoEstadoEquipo}
                      onChange={(e) => setNuevoEstadoEquipo(e.target.value)}
                      className="w-full bg-(--surface) border border-(--border-color) rounded-xl px-4 py-2.5 text-sm text-(--text-primary) focus:outline-none focus:border-amber-500 transition-colors"
                    >
                      <option value="">(Sin cambios en el equipo)</option>
                      <option value="Operativo">Operativo (listo para usar)</option>
                      <option value="En reparación">En reparación (interviniendo máquina)</option>
                      <option value="Mantenimiento">Mantenimiento (revisión preventiva)</option>
                      <option value="Dado de baja">Dado de baja (daño irreparable / obsoleto)</option>
                    </select>
                    <p className="mt-1 text-[11px] text-(--text-secondary)">
                      El cambio de estado del equipo se reflejará en el inventario del laboratorio y su historial técnico.
                    </p>
                  </div>
                )}

                {(nuevoEstado === 'Resuelta' || nuevoEstado === 'Resuelto') && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-(--tone-emerald-text-400) mb-1.5">
                      Solución técnica aplicada *
                    </label>
                    <textarea
                      rows={3}
                      value={solucionTecnica}
                      onChange={(e) => setSolucionTecnica(e.target.value)}
                      placeholder="Describe los pasos y repuestos aplicados para solucionar la incidencia..."
                      className="w-full bg-(--surface) border border-(--border-color) rounded-xl px-4 py-2.5 text-sm text-(--text-primary) placeholder:text-(--text-secondary) focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                  </div>
                )}

                {error && (
                  <div className="text-(--tone-red-text-700) text-sm bg-(--tone-red-bg-50) border border-(--tone-red-border-200) rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button variant="success" appearance="solid" size="custom"
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Guardar Estado'}
                  </Button>
                </div>
              </form>
            )}

            {!canEdit && (
              <div className="flex justify-end pt-2">
                <Button variant="cancel" appearance="soft" size="custom"
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  Cerrar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LIGHTBOX / VISOR DE IMAGEN EN PANTALLA COMPLETA */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center bg-(--surface) border border-(--border-color) rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar */}
            <div className="w-full flex items-center justify-between px-5 py-3 bg-(--surface-subtle) border-b border-(--border-color) text-(--text-primary)">
              <div className="flex items-center gap-2 min-w-0 pr-4">
                <FontAwesomeIcon icon={faImage} className="text-(--tone-amber-text-400) shrink-0" />
                <span className="text-xs font-semibold truncate text-(--text-secondary)">
                  {selectedImage.nombreOriginal}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={getAttachmentUrl(selectedImage.urlArchivo)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-(--surface-muted) hover:bg-(--surface-hover) text-(--text-primary) text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                  title="Abrir en pestaña nueva"
                >
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[11px]" />
                  <span>Abrir original</span>
                </a>
                <Button variant="cancel" appearance="soft" size="custom"
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  title="Cerrar visor"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </Button>
              </div>
            </div>

            {/* Main Image */}
            <div className="p-4 flex items-center justify-center overflow-auto max-h-[75vh] bg-(--surface)">
              <img
                src={getAttachmentUrl(selectedImage.urlArchivo)}
                alt={selectedImage.nombreOriginal}
                className="max-h-[70vh] max-w-full rounded-lg object-contain shadow-md"
              />
            </div>

            {/* Footer with metadata */}
            <div className="w-full px-5 py-2.5 bg-(--surface-subtle) border-t border-(--border-color) flex items-center justify-between text-[11px] text-(--text-secondary)">
              <span>Subido: {formatDate(selectedImage.fechaSubida)}</span>
              <span>
                Tamaño:{' '}
                {selectedImage.tamanioByte / 1024 < 1024
                  ? `${(selectedImage.tamanioByte / 1024).toFixed(1)} KB`
                  : `${(selectedImage.tamanioByte / (1024 * 1024)).toFixed(2)} MB`}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
