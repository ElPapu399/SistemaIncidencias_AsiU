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
} from '@fortawesome/free-solid-svg-icons';
import type { Incident, IncidentStatus, ArchivoAdjunto } from '../../types/incident';
import {
  cambiarEstado,
  obtenerAdjuntos,
  subirAdjunto,
  getAttachmentUrl,
} from '../../services/incidenciasService';
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

  // Evidencia Fotográfica / Adjuntos
  const [adjuntos, setAdjuntos] = useState<ArchivoAdjunto[]>([]);
  const [loadingAdjuntos, setLoadingAdjuntos] = useState(false);
  const [uploadingAdjunto, setUploadingAdjunto] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ArchivoAdjunto | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen || !incident) return;
    setError('');
    setNuevoEstado(incident.status);
    setSolucionTecnica(incident.solucionTecnica || '');
    setSelectedImage(null);

    // Cargar archivos adjuntos si tiene numericId
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
    } else {
      setAdjuntos([]);
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
        <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden z-10">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-mono text-amber-600 font-semibold">{incident.id}</span>
              <h3 className="text-lg font-bold text-slate-900 leading-tight mt-0.5">{incident.title}</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-200 hover:bg-slate-400 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
            {/* Badges & Meta */}
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200">
              <StatusBadge status={incident.status} />
              <PriorityBadge priority={incident.priority} />
              <span className="text-xs text-slate-600 ml-auto flex items-center gap-1.5">
                <FontAwesomeIcon icon={faClock} />
                {formatDate(incident.createdAt)}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-100 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 uppercase tracking-wider block font-semibold">Reportado por</span>
                <span className="text-slate-800 font-medium">{incident.reporter}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase tracking-wider block font-semibold">Técnico Asignado</span>
                <span className="text-slate-800 font-medium">{incident.assignee}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase tracking-wider block font-semibold">Ubicación</span>
                <span className="text-slate-800 font-medium">{incident.location}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase tracking-wider block font-semibold">Categoría</span>
                <span className="text-slate-800 font-medium">
                  {incident.category} {incident.especialidad ? `(${incident.especialidad})` : ''}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Descripción
              </label>
              <div className="bg-slate-100 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {incident.description}
              </div>
            </div>

            {/* SECCIÓN DE EVIDENCIA FOTOGRÁFICA / ADJUNTOS */}
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faCamera} className="text-amber-500" />
                    Evidencia Fotográfica
                  </label>
                  {adjuntos.length > 0 && (
                    <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold rounded-full">
                      {adjuntos.length} {adjuntos.length === 1 ? 'foto' : 'fotos'}
                    </span>
                  )}
                </div>

                {/* Botón para subir nueva foto */}
                <div>
                  <button
                    type="button"
                    disabled={uploadingAdjunto}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {uploadingAdjunto ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin className="text-amber-500 text-xs" />
                        <span>Subiendo...</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faPlus} className="text-amber-500 text-xs" />
                        <span>Adjuntar foto</span>
                      </>
                    )}
                  </button>
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
                <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-800 flex items-center justify-center gap-2">
                  <FontAwesomeIcon icon={faSpinner} spin className="text-amber-500" />
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
                        className="group relative bg-white border border-slate-200 hover:border-amber-400 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-black/40"
                      >
                        {/* Thumbnail */}
                        <div className="w-full h-24 sm:h-28 overflow-hidden bg-slate-100 flex items-center justify-center">
                          <img
                            src={fullUrl}
                            alt={adj.nombreOriginal}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              // Fallback si la imagen no carga
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white">
                          <FontAwesomeIcon icon={faMagnifyingGlassPlus} className="text-lg text-amber-400" />
                          <span className="text-[10px] font-semibold tracking-wider uppercase">Ver grande</span>
                        </div>

                        {/* Caption */}
                        <div className="p-2 bg-white border-t border-slate-200">
                          <p className="text-[11px] font-medium text-slate-700 truncate" title={adj.nombreOriginal}>
                            {adj.nombreOriginal}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
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
                  className="py-5 px-4 text-center bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 hover:border-amber-400 rounded-xl cursor-pointer transition-colors"
                >
                  <FontAwesomeIcon icon={faImage} className="text-slate-500 text-lg mb-1 block mx-auto" />
                  <p className="text-xs text-slate-400 font-medium">No hay fotos de evidencia adjuntas</p>
                  <p className="text-[11px] text-amber-600 mt-0.5 underline decoration-amber-400/30">
                    Haz clic aquí para agregar una foto ahora
                  </p>
                </div>
              )}
            </div>

            {/* Technical Solution (if resolved or editing) */}
            {incident.solucionTecnica && !canEdit && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faCheckCircle} /> Solución Técnica
                </label>
                <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-3.5 text-sm text-emerald-200">
                  {incident.solucionTecnica}
                </div>
              </div>
            )}

            {/* Edit section for Admin/Technician */}
            {canEdit && (
              <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Cambiar estado *
                  </label>
                  <select
                    value={nuevoEstado}
                    onChange={(e) => setNuevoEstado(e.target.value as IncidentStatus)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Asignada">Asignada</option>
                    <option value="En atención">En atención (En Proceso)</option>
                    <option value="Resuelta">Resuelta</option>
                    <option value="Cerrada">Cerrada</option>
                  </select>
                </div>

                {(nuevoEstado === 'Resuelta' || nuevoEstado === 'Resuelto') && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1.5">
                      Solución técnica aplicada *
                    </label>
                    <textarea
                      rows={3}
                      value={solucionTecnica}
                      onChange={(e) => setSolucionTecnica(e.target.value)}
                      placeholder="Describe los pasos y repuestos aplicados para solucionar la incidencia..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500/50 transition-colors"
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
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-red-600/70 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-slate-950 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-red-400 hover:bg-red-600 transition-colors"
                >
                  Cerrar
                </button>
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
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center bg-white border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar */}
            <div className="w-full flex items-center justify-between px-5 py-3 bg-slate-800 border-b border-slate-800 text-white">
              <div className="flex items-center gap-2 min-w-0 pr-4">
                <FontAwesomeIcon icon={faImage} className="text-amber-400 shrink-0" />
                <span className="text-xs font-semibold truncate text-slate-200">
                  {selectedImage.nombreOriginal}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={getAttachmentUrl(selectedImage.urlArchivo)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-500 hover:bg-slate-600 text-slate-300 hover:text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                  title="Abrir en pestaña nueva"
                >
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[11px]" />
                  <span>Abrir original</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 flex items-center justify-center transition-colors"
                  title="Cerrar visor"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            </div>

            {/* Main Image */}
            <div className="p-4 flex items-center justify-center overflow-auto max-h-[75vh] bg-white">
              <img
                src={getAttachmentUrl(selectedImage.urlArchivo)}
                alt={selectedImage.nombreOriginal}
                className="max-h-[70vh] max-w-full rounded-lg object-contain shadow-md"
              />
            </div>

            {/* Footer with metadata */}
            <div className="w-full px-5 py-2.5 bg-slate-800 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
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
