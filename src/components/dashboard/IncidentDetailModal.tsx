import Button from '../Button';
import { useState, useEffect, type ReactNode } from 'react';
import type { Incident, ArchivoAdjunto } from '../../types/incident';
import { obtenerAdjuntos, getAttachmentUrl } from '../../services/incidenciasService';
import { StatusBadge, PriorityBadge, CategoryLabel, formatDate } from './IncidentBadges';
import {
  Eye, X, History, RefreshCw, Clock, User, MapPin, Laptop,
  Image as ImageIcon, CheckCircle2, ExternalLink, ArrowRightLeft, Star,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface IncidentDetailModalProps {
  isOpen: boolean;
  incident: Incident | null;
  currentUserRole?: string;
  currentUserId?: number;
  onClose: () => void;
  onOpenTraceability?: (incident: Incident) => void;
  onOpenChangeStatus?: (incident: Incident) => void;
  onRate?: (incident: Incident) => void;
}

function InfoCard({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="bg-(--surface-subtle) border border-(--border-color)/70 rounded-2xl p-3.5 flex items-start gap-2.5">
      <Icon className="w-4 h-4 text-(--text-secondary) shrink-0 mt-0.5" />
      <div>
        <span className="text-[10px] font-semibold text-(--text-secondary) uppercase tracking-wider block">{label}</span>
        {children}
      </div>
    </div>
  );
}

export default function IncidentDetailModal({
  isOpen, incident, currentUserRole, currentUserId, onClose, onOpenTraceability, onOpenChangeStatus, onRate,
}: IncidentDetailModalProps) {
  const [adjuntos, setAdjuntos] = useState<ArchivoAdjunto[]>([]);
  const [loadingAdjuntos, setLoadingAdjuntos] = useState(false);
  const [zoomUrl, setZoomUrl] = useState<{ src: string; name: string } | null>(null);

  useEffect(() => {
    if (!isOpen || !incident?.numericId) return;

    let isMounted = true;
    const cargar = async () => {
      try {
        setLoadingAdjuntos(true);
        const data = await obtenerAdjuntos(incident.numericId!);
        if (isMounted) setAdjuntos(Array.isArray(data) ? data : []);
      } catch {
        if (isMounted) setAdjuntos([]);
      } finally {
        if (isMounted) setLoadingAdjuntos(false);
      }
    };
    cargar();

    return () => {
      isMounted = false;
      setAdjuntos([]);
      setZoomUrl(null);
    };
  }, [isOpen, incident?.numericId]);

  if (!isOpen || !incident) return null;

  const canChangeStatus = ['ADMIN', 'TECNICO_GENERAL', 'TECNICO_ESPECIALISTA', 'TECNICO'].includes(currentUserRole || '');
  const isReporter = !currentUserId || !incident.reporterId || Number(currentUserId) === Number(incident.reporterId);
  const canRate = Boolean(onRate && currentUserRole === 'ESTUDIANTE' && incident.status === 'Resuelta' && !incident.calificacion && isReporter);

  const openAndClose = (fn?: (inc: Incident) => void) => {
    if (!fn) return undefined;
    return () => { onClose(); fn(incident); };
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

        <div className="relative bg-(--surface) rounded-2xl shadow-2xl border border-(--border-color) w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden z-10">
          {/* Header */}
          <div className="px-6 py-5 border-b border-(--border-color) bg-(--surface-subtle)/80 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-(--tone-amber-text-600) bg-(--tone-amber-bg-50) px-2.5 py-0.5 rounded-lg border border-(--tone-amber-border-200)">
                  {incident.id}
                </span>
                <span className="text-xs text-(--text-secondary) font-medium">Detalle de la Incidencia</span>
              </div>
              <h3 className="text-lg font-bold text-(--text-primary) leading-snug mt-1">{incident.title}</h3>
            </div>
            <Button variant="cancel" appearance="soft" size="custom" type="button" onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0" title="Cerrar">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Badges Bar */}
          <div className="px-6 py-3 bg-(--surface) border-b border-(--border-color) flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={incident.status} />
              <PriorityBadge priority={incident.priority} />
              <CategoryLabel category={incident.category} especialidad={incident.especialidad} />
            </div>
            <span className="text-xs text-(--text-secondary) flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-(--text-secondary)" />
              {formatDate(incident.createdAt)}
            </span>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <InfoCard icon={User} label="Reportado por">
                <span className="text-(--text-primary) font-semibold text-sm">{incident.reporter || 'Estudiante'}</span>
              </InfoCard>

              <InfoCard icon={User} label="Técnico Asignado">
                {incident.fueReasignada && incident.tecnicoAnteriorNombre ? (
                  <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                    <span className="line-through text-(--text-secondary) text-xs">{incident.tecnicoAnteriorNombre}</span>
                    <span className="text-(--tone-violet-text-600) font-bold text-xs">➔</span>
                    <span className="text-(--text-primary) font-bold text-sm">{incident.assignee}</span>
                  </div>
                ) : (
                  <span className="text-(--text-primary) font-semibold text-sm">{incident.assignee}</span>
                )}
              </InfoCard>

              <InfoCard icon={MapPin} label="Ubicación">
                <span className="text-(--text-primary) font-medium text-xs">{incident.location || 'Campus Universitario'}</span>
              </InfoCard>

              <InfoCard icon={Laptop} label="Equipo Afectado">
                <span className="text-(--text-primary) font-medium text-xs">
                  {incident.equipoCodigo
                    ? incident.equipoCodigo + (incident.equipoTipo ? ` (${incident.equipoTipo})` : '')
                    : 'Sin equipo específico'}
                </span>
              </InfoCard>
            </div>

            {/* Banner de Reasignación */}
            {incident.fueReasignada && (
              <div className="p-3.5 bg-(--tone-violet-bg-50)/80 border border-(--tone-violet-border-200) rounded-2xl flex items-start gap-3">
                <ArrowRightLeft className="w-5 h-5 text-(--tone-violet-text-600) shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-(--tone-violet-text-900)">
                    Incidencia Reasignada por {incident.reasignadoPorNombre || 'Soporte'}
                  </p>
                  <p className="text-(--tone-violet-text-700) mt-0.5">
                    Originalmente a cargo de <strong>{incident.tecnicoAnteriorNombre}</strong>, transferida a{' '}
                    <strong>{incident.assignee}</strong>.
                  </p>
                  {incident.motivoReasignacion && (
                    <p className="text-[11px] text-(--tone-violet-text-600)/90 mt-1 italic">"{incident.motivoReasignacion}"</p>
                  )}
                </div>
              </div>
            )}

            {/* Descripción */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-(--text-secondary) mb-1.5">Descripción del Problema</label>
              <div className="bg-(--surface-subtle) border border-(--border-color)/80 rounded-2xl p-4 text-sm text-(--text-primary) leading-relaxed whitespace-pre-wrap">
                {incident.description || 'Sin descripción adicional.'}
              </div>
            </div>

            {/* Solución Técnica */}
            {incident.solucionTecnica && (
              <div className="p-4 bg-(--tone-emerald-bg-50)/70 border border-(--tone-emerald-border-200) rounded-2xl">
                <h4 className="text-xs font-bold text-(--tone-emerald-text-800) uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-(--tone-emerald-text-600)" />
                  Solución Técnica Aplicada
                </h4>
                <p className="text-xs text-(--tone-emerald-text-900) leading-relaxed whitespace-pre-wrap">{incident.solucionTecnica}</p>
              </div>
            )}

            {/* Calificación del estudiante */}
            {incident.calificacion && (
              <div className={`p-4 rounded-2xl border ${
                incident.calificacion <= 2
                  ? 'bg-(--tone-red-bg-50)/70 border-(--tone-red-border-200)'
                  : 'bg-(--tone-amber-bg-50)/70 border-(--tone-amber-border-200)'
              }`}>
                <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2 ${
                  incident.calificacion <= 2 ? 'text-(--tone-red-text-800)' : 'text-(--tone-amber-text-800)'
                }`}>
                  <Star className={`w-4 h-4 ${incident.calificacion <= 2 ? 'text-(--tone-red-text-500) fill-red-500' : 'text-(--tone-amber-text-500)'}`} />
                  Calificación del Estudiante
                </h4>
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < incident.calificacion!
                          ? incident.calificacion! <= 2
                            ? 'fill-red-400 text-(--tone-red-text-400)'
                            : 'fill-amber-400 text-(--tone-amber-text-400)'
                          : 'fill-transparent text-(--text-secondary)'
                      }`}
                    />
                  ))}
                  <span className={`ml-2 text-sm font-bold ${
                    incident.calificacion <= 2 ? 'text-(--tone-red-text-700)' : 'text-(--tone-amber-text-700)'
                  }`}>
                    {incident.calificacion}/5
                  </span>
                </div>
                {incident.motivoCalificacion && (
                  <div className="mb-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                      incident.calificacion <= 2
                        ? 'bg-(--tone-red-bg-100) text-(--tone-red-text-800) border-(--tone-red-border-200)'
                        : 'bg-(--tone-amber-bg-100) text-(--tone-amber-text-900) border-(--tone-amber-border-200)'
                    }`}>
                      <span className="font-bold opacity-75">Motivo:</span>
                      <span>{incident.motivoCalificacion}</span>
                    </span>
                  </div>
                )}
                {incident.comentarioCalificacion && (
                  <p className={`text-xs italic ${
                    incident.calificacion <= 2 ? 'text-(--tone-red-text-900)/90' : 'text-(--tone-amber-text-900)/80'
                  }`}>
                    "{incident.comentarioCalificacion}"
                  </p>
                )}
              </div>
            )}

            {/* Evidencias */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-(--text-secondary) mb-2 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-(--text-secondary)" />
                Evidencias Fotográficas ({adjuntos.length})
              </label>
              {loadingAdjuntos ? (
                <div className="py-6 text-center text-(--text-secondary) text-xs">Cargando imágenes...</div>
              ) : adjuntos.length === 0 ? (
                <div className="p-4 bg-(--surface-subtle) border border-dashed border-(--border-color) rounded-2xl text-center text-xs text-(--text-secondary)">
                  No hay fotografías adjuntas en esta incidencia.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {adjuntos.map((adj) => {
                    const imgUrl = getAttachmentUrl(adj.urlArchivo);
                    return (
                      <div key={adj.id} className="group relative rounded-xl overflow-hidden border border-(--border-color) bg-(--surface-muted) aspect-video cursor-pointer" onClick={() => setZoomUrl({ src: imgUrl, name: adj.nombreOriginal })}>
                        <img src={imgUrl} alt={adj.nombreOriginal} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          {(onOpenTraceability || canRate || (canChangeStatus && onOpenChangeStatus)) && (
          <div className="px-6 py-4 bg-(--surface-subtle) border-t border-(--border-color) flex flex-wrap items-center justify-between gap-3">
            {onOpenTraceability && (
              <Button variant="info" appearance="soft" size="custom" type="button" onClick={openAndClose(onOpenTraceability)} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs">
                <History className="w-3.5 h-3.5" />
                <span>Ver Trazabilidad Completa</span>
              </Button>
            )}
            <div className="flex items-center gap-2 ml-auto">
              {canRate && (
                <Button variant="info" appearance="soft" size="custom" type="button" onClick={openAndClose(onRate)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs">
                  <Star className="w-3.5 h-3.5" />
                  <span>Calificar Atención</span>
                </Button>
              )}
              {canChangeStatus && onOpenChangeStatus && (
                <Button variant="success" appearance="solid" size="custom" type="button" onClick={openAndClose(onOpenChangeStatus)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Actualizar Estado / Solución</span>
                </Button>
              )}
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomUrl && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setZoomUrl(null)}>
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <img src={zoomUrl.src} alt={zoomUrl.name} className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl" />
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs text-white/80 font-mono">{zoomUrl.name}</span>
              <a href={zoomUrl.src} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-(--tone-amber-text-400) hover:text-(--tone-amber-text-300) underline" onClick={(e) => e.stopPropagation()}>
                <ExternalLink className="w-3.5 h-3.5" />
                Ver tamaño completo
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
