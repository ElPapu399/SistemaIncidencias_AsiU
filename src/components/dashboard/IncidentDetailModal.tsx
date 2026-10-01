import { useState, useEffect, type ReactNode } from 'react';
import type { Incident, ArchivoAdjunto } from '../../types/incident';
import { obtenerAdjuntos, getAttachmentUrl } from '../../services/incidenciasService';
import { StatusBadge, PriorityBadge, CategoryLabel, formatDate } from './IncidentBadges';
import {
  Eye, X, History, RefreshCw, Clock, User, MapPin, Laptop,
  Image as ImageIcon, CheckCircle2, ExternalLink, ArrowRightLeft,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface IncidentDetailModalProps {
  isOpen: boolean;
  incident: Incident | null;
  currentUserRole?: string;
  onClose: () => void;
  onOpenTraceability?: (incident: Incident) => void;
  onOpenChangeStatus?: (incident: Incident) => void;
}

/** Tarjeta reutilizable del grid de información */
function InfoCard({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5 flex items-start gap-2.5">
      <Icon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
      <div>
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">{label}</span>
        {children}
      </div>
    </div>
  );
}

export default function IncidentDetailModal({
  isOpen, incident, currentUserRole, onClose, onOpenTraceability, onOpenChangeStatus,
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

  const openAndClose = (fn?: (inc: Incident) => void) => {
    if (!fn) return undefined;
    return () => { onClose(); fn(incident); };
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden z-10">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                  {incident.id}
                </span>
                <span className="text-xs text-slate-500 font-medium">Detalle de la Incidencia</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 leading-snug mt-1">{incident.title}</h3>
            </div>
            <button type="button" onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-200/70 hover:bg-slate-300 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer shrink-0" title="Cerrar">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Badges Bar */}
          <div className="px-6 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={incident.status} />
              <PriorityBadge priority={incident.priority} />
              <CategoryLabel category={incident.category} especialidad={incident.especialidad} />
            </div>
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {formatDate(incident.createdAt)}
            </span>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <InfoCard icon={User} label="Reportado por">
                <span className="text-slate-800 font-semibold text-sm">{incident.reporter || 'Estudiante'}</span>
              </InfoCard>

              <InfoCard icon={User} label="Técnico Asignado">
                {incident.fueReasignada && incident.tecnicoAnteriorNombre ? (
                  <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                    <span className="line-through text-slate-400 text-xs">{incident.tecnicoAnteriorNombre}</span>
                    <span className="text-violet-600 font-bold text-xs">➔</span>
                    <span className="text-slate-900 font-bold text-sm">{incident.assignee}</span>
                  </div>
                ) : (
                  <span className="text-slate-800 font-semibold text-sm">{incident.assignee}</span>
                )}
              </InfoCard>

              <InfoCard icon={MapPin} label="Ubicación">
                <span className="text-slate-800 font-medium text-xs">{incident.location || 'Campus Universitario'}</span>
              </InfoCard>

              <InfoCard icon={Laptop} label="Equipo Afectado">
                <span className="text-slate-800 font-medium text-xs">
                  {incident.equipoCodigo
                    ? incident.equipoCodigo + (incident.equipoTipo ? ` (${incident.equipoTipo})` : '')
                    : 'Sin equipo específico'}
                </span>
              </InfoCard>
            </div>

            {/* Banner de Reasignación */}
            {incident.fueReasignada && (
              <div className="p-3.5 bg-violet-50/80 border border-violet-200 rounded-2xl flex items-start gap-3">
                <ArrowRightLeft className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-violet-900">
                    Incidencia Reasignada por {incident.reasignadoPorNombre || 'Soporte'}
                  </p>
                  <p className="text-violet-700 mt-0.5">
                    Originalmente a cargo de <strong>{incident.tecnicoAnteriorNombre}</strong>, transferida a{' '}
                    <strong>{incident.assignee}</strong>.
                  </p>
                  {incident.motivoReasignacion && (
                    <p className="text-[11px] text-violet-600/90 mt-1 italic">"{incident.motivoReasignacion}"</p>
                  )}
                </div>
              </div>
            )}

            {/* Descripción */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Descripción del Problema</label>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {incident.description || 'Sin descripción adicional.'}
              </div>
            </div>

            {/* Solución Técnica */}
            {incident.solucionTecnica && (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Solución Técnica Aplicada
                </h4>
                <p className="text-xs text-emerald-900 leading-relaxed whitespace-pre-wrap">{incident.solucionTecnica}</p>
              </div>
            )}

            {/* Evidencias */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-slate-400" />
                Evidencias Fotográficas ({adjuntos.length})
              </label>
              {loadingAdjuntos ? (
                <div className="py-6 text-center text-slate-400 text-xs">Cargando imágenes...</div>
              ) : adjuntos.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400">
                  No hay fotografías adjuntas en esta incidencia.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {adjuntos.map((adj) => {
                    const imgUrl = getAttachmentUrl(adj.urlArchivo);
                    return (
                      <div key={adj.id} className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video cursor-pointer" onClick={() => setZoomUrl({ src: imgUrl, name: adj.nombreOriginal })}>
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
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            {onOpenTraceability && (
              <button type="button" onClick={openAndClose(onOpenTraceability)} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-violet-700 bg-violet-100 hover:bg-violet-200 border border-violet-300 transition-all cursor-pointer shadow-xs">
                <History className="w-3.5 h-3.5" />
                <span>Ver Trazabilidad Completa</span>
              </button>
            )}
            <div className="flex items-center gap-2 ml-auto">
              {canChangeStatus && onOpenChangeStatus && (
                <button type="button" onClick={openAndClose(onOpenChangeStatus)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition-all cursor-pointer shadow-xs">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Actualizar Estado / Solución</span>
                </button>
              )}
              <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomUrl && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setZoomUrl(null)}>
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <img src={zoomUrl.src} alt={zoomUrl.name} className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl" />
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs text-white/80 font-mono">{zoomUrl.name}</span>
              <a href={zoomUrl.src} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 underline" onClick={(e) => e.stopPropagation()}>
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
