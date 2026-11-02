import { useState, useEffect, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar as faStarSolid,
  faCommentDots,
  faUserShield,
  faQuoteLeft,
  faTicket,
  faXmark,
  faFilter,
  faArrowDownWideShort,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import Header from '../components/dashboard/Header';
import SearchBar from '../components/dashboard/SearchBar';
import type { TecnicoCalificacion, ComentarioCalificacion } from '../services/incidenciasService';
import { obtenerCalificacionesTecnicos, obtenerMisCalificaciones } from '../services/incidenciasService';
import { getCurrentUser } from '../utils/auth';
import { CardsGridSkeleton, TableSkeleton } from '../components/dashboard/SkeletonLoaders';

interface CalificacionesTecnicosPageProps {
  title?: string;
  description?: string;
}

const MOTIVOS_PREDETERMINADOS = [
  'Problema no solucionado',
  'Demasiado tiempo de espera',
  'Mala atención o trato',
  'Falta de comunicación',
  'Solución incompleta',
  'Otro motivo',
  'Atención rápida y eficaz',
  'Excelente trato del técnico',
  'Problema 100% resuelto',
  'Buena comunicación',
];

/* ─── Star Rating Display ─── */
function StarRating({ rating = 0, size = 'text-base' }: { rating?: number; size?: string }) {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));
  const fullStars = Math.floor(safeRating);
  const hasHalf = safeRating - fullStars >= 0.5;
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalf ? 1 : 0));

  return (
    <div className={`flex items-center gap-0.5 ${size}`} aria-label={`${safeRating} de 5 estrellas`}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <FontAwesomeIcon key={`full-${i}`} icon={faStarSolid} className="text-amber-400" />
      ))}
      {hasHalf && (
        <span className="relative inline-block text-amber-400">
          <FontAwesomeIcon icon={faStarRegular} className="text-slate-300" />
          <span className="absolute inset-0 overflow-hidden w-1/2">
            <FontAwesomeIcon icon={faStarSolid} className="text-amber-400" />
          </span>
        </span>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <FontAwesomeIcon key={`empty-${i}`} icon={faStarRegular} className="text-slate-300" />
      ))}
    </div>
  );
}

/* ─── Helpers ─── */
function getRatingColor(rating: number = 0): string {
  if (rating >= 4.0) return 'text-emerald-600';
  if (rating >= 3.0) return 'text-amber-500';
  if (rating > 0) return 'text-rose-500';
  return 'text-slate-400';
}

function getRatingBg(rating: number = 0): string {
  if (rating >= 4.0) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (rating >= 3.0) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (rating > 0) return 'bg-rose-50 text-rose-700 border-rose-200';
  return 'bg-slate-50 text-slate-500 border-slate-200';
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? '—'
      : d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

function getMotivoBadgeStyle(motivo: string = ''): string {
  const m = motivo.toLowerCase();
  if (m.includes('no solucionado') || m.includes('incompleta')) {
    return 'bg-red-50 text-red-700 border-red-200';
  }
  if (m.includes('tiempo') || m.includes('espera')) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  if (m.includes('mala') || m.includes('falta')) {
    return 'bg-orange-50 text-orange-700 border-orange-200';
  }
  if (m.includes('rápida') || m.includes('eficaz') || m.includes('excelente') || m.includes('100%')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  return 'bg-blue-50 text-blue-700 border-blue-200';
}

/* ─── Comments Modal (Admin View) ─── */
function ComentariosModal({
  tecnico,
  onClose,
}: {
  tecnico: TecnicoCalificacion;
  onClose: () => void;
}) {
  const comentarios = tecnico.comentarios ?? [];
  const iniciales = `${tecnico.tecnicoNombre?.[0] ?? 'T'}${tecnico.tecnicoApellido?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {iniciales}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {tecnico.tecnicoNombre} {tecnico.tecnicoApellido}
              </h3>
              <p className="text-xs text-slate-500">
                {tecnico.especialidad ?? 'Sin especialidad'} · {tecnico.totalCalificaciones ?? 0}{' '}
                {tecnico.totalCalificaciones === 1 ? 'evaluación' : 'evaluaciones'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border bg-white border-slate-200">
              <span className={`text-base font-bold ${getRatingColor(tecnico.promedioCalificacion)}`}>
                {tecnico.promedioCalificacion ?? 0}
              </span>
              <StarRating rating={tecnico.promedioCalificacion} size="text-xs" />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        </div>

        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {comentarios.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FontAwesomeIcon icon={faCommentDots} className="text-3xl mb-2" />
              <p className="text-sm">No hay comentarios registrados para este técnico.</p>
            </div>
          ) : (
            comentarios.map((c) => (
              <ComentarioItem key={`${c.incidenciaId}-${c.codigoTicket}`} comentario={c} />
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Single Comment Card ─── */
function ComentarioItem({ comentario }: { comentario: ComentarioCalificacion }) {
  const estudianteNombre = comentario.estudianteNombre || 'Estudiante';
  const inicial = estudianteNombre.charAt(0).toUpperCase() || 'E';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">{inicial}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {estudianteNombre}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <FontAwesomeIcon icon={faTicket} className="text-[10px]" />
              <span>{comentario.codigoTicket}</span>
              <span>·</span>
              <span>{formatDate(comentario.fechaCierre)}</span>
            </div>
          </div>
        </div>
        <StarRating rating={comentario.calificacion} size="text-sm" />
      </div>

      <p className="text-sm font-medium text-slate-700 mt-3">{comentario.tituloIncidencia}</p>

      {comentario.motivo && (
        <span
          className={`inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full border ${getMotivoBadgeStyle(comentario.motivo)}`}
        >
          {comentario.motivo}
        </span>
      )}

      {comentario.comentario && (
        <div className="mt-2.5 bg-slate-50 rounded-lg p-3 border-l-3 border-slate-300">
          <FontAwesomeIcon icon={faQuoteLeft} className="text-xs text-slate-300 mr-1.5" />
          <span className="text-sm text-slate-600 italic">{comentario.comentario}</span>
        </div>
      )}

      {!comentario.motivo && !comentario.comentario && (
        <p className="text-xs text-slate-400 italic mt-2">Sin comentarios adicionales</p>
      )}
    </div>
  );
}

/* ─── Technician Card (Admin View) ─── */
function TecnicoCard({
  tecnico,
  onViewComments,
}: {
  tecnico: TecnicoCalificacion;
  onViewComments: () => void;
}) {
  const comentarios = tecnico.comentarios ?? [];
  const tieneComentarios = comentarios.length > 0;
  const ultimosComentarios = comentarios.slice(0, 2);
  const iniciales = `${tecnico.tecnicoNombre?.[0] ?? 'T'}${tecnico.tecnicoApellido?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
              {iniciales}
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 leading-snug">
                {tecnico.tecnicoNombre} {tecnico.tecnicoApellido}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <FontAwesomeIcon icon={faUserShield} className="text-slate-400 text-[10px]" />
                <span>{tecnico.especialidad ?? 'Sin especialidad'}</span>
              </div>
            </div>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-bold shrink-0 ${getRatingBg(
              tecnico.promedioCalificacion
            )}`}
          >
            <FontAwesomeIcon icon={faStarSolid} className="text-amber-400 text-xs" />
            <span>{tecnico.promedioCalificacion > 0 ? tecnico.promedioCalificacion.toFixed(1) : '—'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-y border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <StarRating rating={tecnico.promedioCalificacion} size="text-sm" />
            <span className="text-xs text-slate-400 font-medium">
              ({tecnico.promedioCalificacion > 0 ? tecnico.promedioCalificacion.toFixed(1) : '0'} / 5)
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {tecnico.totalCalificaciones ?? 0} {tecnico.totalCalificaciones === 1 ? 'evaluación' : 'evaluaciones'}
          </span>
        </div>

        {tieneComentarios ? (
          <div className="space-y-2 mb-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Comentarios recientes
            </p>
            {ultimosComentarios.map((c) => (
              <div
                key={`${c.incidenciaId}-${c.codigoTicket}`}
                className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-600"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-700">{c.estudianteNombre}</span>
                  <div className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faStarSolid} className="text-amber-400 text-[10px]" />
                    <span className="font-bold text-slate-700">{c.calificacion}</span>
                  </div>
                </div>
                {c.comentario ? (
                  <p className="text-slate-500 italic line-clamp-2">&quot;{c.comentario}&quot;</p>
                ) : (
                  <p className="text-slate-400 italic">
                    {c.motivo ? `Motivo: ${c.motivo}` : 'Sin comentario'}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic py-4 text-center">
            Aún no tiene comentarios registrados
          </p>
        )}
      </div>

      {tieneComentarios && (
        <button
          type="button"
          onClick={onViewComments}
          className="w-full mt-2 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <FontAwesomeIcon icon={faCommentDots} />
          Ver todas las evaluaciones ({tecnico.totalCalificaciones})
        </button>
      )}
    </div>
  );
}

/* ─── Individual Technician View ─── */
function VistaTecnicoIndividual({ tecnico }: { tecnico: TecnicoCalificacion }) {
  const [selectedStar, setSelectedStar] = useState<number | null>(null);
  const [selectedMotivo, setSelectedMotivo] = useState<string>('');

  const comentarios = tecnico.comentarios ?? [];
  const total = Number(tecnico.totalCalificaciones) || comentarios.length || 0;
  const promedio = Number(tecnico.promedioCalificacion) || 0;
  const iniciales = `${tecnico.tecnicoNombre?.[0] ?? 'T'}${tecnico.tecnicoApellido?.[0] ?? ''}`.toUpperCase();

  const starCounts = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    comentarios.forEach((c) => {
      if (c && c.calificacion >= 1 && c.calificacion <= 5) {
        counts[c.calificacion] = (counts[c.calificacion] || 0) + 1;
      }
    });
    return counts;
  }, [comentarios]);

  const porcentajePositivas = useMemo(() => {
    if (total === 0) return 0;
    const positivas = (starCounts[5] || 0) + (starCounts[4] || 0);
    return Math.round((positivas / total) * 100);
  }, [starCounts, total]);

  const motivosPresentes = useMemo(() => {
    const set = new Set<string>();
    comentarios.forEach((c) => {
      if (c?.motivo) set.add(c.motivo);
    });
    return Array.from(set);
  }, [comentarios]);

  const filteredComentarios = useMemo(() => {
    return comentarios.filter((c) => {
      if (!c) return false;
      if (selectedStar !== null && c.calificacion !== selectedStar) return false;
      if (selectedMotivo && c.motivo !== selectedMotivo) return false;
      return true;
    });
  }, [comentarios, selectedStar, selectedMotivo]);

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
              <span className="text-white text-2xl font-black">{iniciales}</span>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl font-bold text-slate-900">
                  {tecnico.tecnicoNombre} {tecnico.tecnicoApellido}
                </h3>
                {tecnico.especialidad && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {tecnico.especialidad}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Panel de rendimiento y valoraciones de satisfacción recibidas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
            <div className="text-left lg:text-right">
              <div className="flex items-center lg:justify-end gap-2">
                <span className="text-4xl font-extrabold text-slate-900">
                  {promedio > 0 ? promedio.toFixed(1) : '—'}
                </span>
                <span className="text-sm text-slate-400 font-medium">/ 5.0</span>
              </div>
              <div className="flex items-center lg:justify-end mt-1">
                <StarRating rating={promedio} size="text-base" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {total} {total === 1 ? 'evaluación' : 'evaluaciones'} en total
              </p>
            </div>
          </div>
        </div>

        {/* 3 Metrics cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
              Promedio General
            </p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {promedio > 0 ? `${promedio.toFixed(1)} ★` : 'Sin datos'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Calculado en base a tickets cerrados</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
              Tickets Evaluados
            </p>
            <span className="text-2xl font-bold text-slate-900">{total}</span>
            <p className="text-xs text-slate-500 mt-1">Con encuesta de satisfacción</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
              Satisfacción de Usuarios
            </p>
            <span className="text-2xl font-bold text-emerald-600">
              {total > 0 ? `${porcentajePositivas}%` : '—'}
            </span>
            <p className="text-xs text-slate-500 mt-1">Calificaciones positivas (4 y 5 ★)</p>
          </div>
        </div>
      </div>

      {total > 0 ? (
        <>
          {/* Distribution & filter */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
              Distribución de Calificaciones
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              {/* Progress bars */}
              <div className="space-y-2.5">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = starCounts[stars] || 0;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  const isSelected = selectedStar === stars;
                  return (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => setSelectedStar(isSelected ? null : stars)}
                      className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer text-left ${
                        isSelected ? 'bg-amber-50 ring-2 ring-amber-400' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1 w-14 shrink-0 text-xs font-semibold text-slate-700">
                        <span>{stars}</span>
                        <FontAwesomeIcon icon={faStarSolid} className="text-amber-400 text-[11px]" />
                      </div>
                      <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            stars >= 4 ? 'bg-emerald-500' : stars === 3 ? 'bg-amber-400' : 'bg-rose-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-16 text-right shrink-0">
                        {count} ({pct}%)
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Filters column */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Filtrar Comentarios
                </p>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-600">Por motivo de calificación:</label>
                  <select
                    value={selectedMotivo}
                    onChange={(e) => setSelectedMotivo(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                  >
                    <option value="">Todos los motivos</option>
                    {motivosPresentes.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {(selectedStar !== null || selectedMotivo) && (
                  <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                    <span className="text-xs text-slate-500">
                      Filtro activo: {selectedStar ? `${selectedStar}★` : ''}
                      {selectedStar && selectedMotivo ? ' · ' : ''}
                      {selectedMotivo ? `"${selectedMotivo}"` : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => { setSelectedStar(null); setSelectedMotivo(''); }}
                      className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* List of comments */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900">
                Opiniones y Comentarios ({filteredComentarios.length})
              </h4>
              {(selectedStar !== null || selectedMotivo) && (
                <span className="text-xs text-slate-500">
                  Mostrando {filteredComentarios.length} de {total}
                </span>
              )}
            </div>

            {filteredComentarios.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center shadow-sm">
                <p className="text-sm font-semibold text-slate-800 text-center">
                  No hay comentarios con los filtros seleccionados
                </p>
                <button
                  type="button"
                  onClick={() => { setSelectedStar(null); setSelectedMotivo(''); }}
                  className="mt-3 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredComentarios.map((c) => (
                  <ComentarioItem key={`${c.incidenciaId}-${c.codigoTicket}`} comentario={c} />
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Empty state when 0 ratings */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
            <FontAwesomeIcon icon={faStarRegular} className="text-3xl text-amber-500" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 text-center">
            Aún no tienes calificaciones registradas
          </h4>
          <p className="text-sm text-slate-500 mt-2 max-w-lg text-center mx-auto">
            Cuando resuelvas incidencias y los estudiantes califiquen la atención del ticket, verás aquí tu promedio de estrellas, desglose de satisfacción y todos sus comentarios.
          </p>
          <div className="mt-6 inline-flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-4 py-2 rounded-xl text-center">
            <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-500 shrink-0" />
            <span>Las evaluaciones se actualizan automáticamente al cerrar cada incidencia</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─── */
export default function CalificacionesTecnicosPage({
  title,
  description,
}: CalificacionesTecnicosPageProps) {
  const usuario = getCurrentUser();
  const isAdmin = usuario?.rol === 'ADMIN';

  const defaultTitle = isAdmin ? 'Calificaciones de Técnicos' : 'Mis Calificaciones';
  const defaultDesc = isAdmin
    ? 'Consulta el desempeño y los comentarios de los técnicos de soporte.'
    : 'Consulta tu puntuación de satisfacción y los comentarios dejados por los estudiantes.';

  const pageTitle = title ?? defaultTitle;
  const pageDesc = description ?? defaultDesc;

  const [tecnicos, setTecnicos] = useState<TecnicoCalificacion[]>([]);
  const [miCalificacion, setMiCalificacion] = useState<TecnicoCalificacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'count'>('rating');
  const [filterMotivo, setFilterMotivo] = useState<string>('');
  const [selectedTecnico, setSelectedTecnico] = useState<TecnicoCalificacion | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (isAdmin) {
        const data = await obtenerCalificacionesTecnicos();
        setTecnicos(data);
      } else {
        try {
          const data = await obtenerMisCalificaciones();
          setMiCalificacion(data);
        } catch {
          // Fallback resiliente si el endpoint /mis-calificaciones falla:
          const todos = await obtenerCalificacionesTecnicos();
          const yo = todos.find((t) => t.tecnicoId === usuario?.id);
          if (yo) {
            setMiCalificacion(yo);
          } else {
            setMiCalificacion({
              tecnicoId: usuario?.id ?? 0,
              tecnicoNombre: usuario?.nombre ?? 'Técnico',
              tecnicoApellido: usuario?.apellido ?? '',
              especialidad: null,
              promedioCalificacion: 0,
              totalCalificaciones: 0,
              comentarios: [],
            });
          }
        }
      }
    } catch {
      setError('No se pudieron cargar las calificaciones');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, usuario?.id, usuario?.nombre, usuario?.apellido]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const motivosPresentes = useMemo(() => {
    const set = new Set<string>();
    tecnicos.forEach((t) =>
      (t.comentarios ?? []).forEach((c) => {
        if (c?.motivo) set.add(c.motivo);
      })
    );
    const ordered = MOTIVOS_PREDETERMINADOS.filter((m) => set.has(m));
    set.forEach((m) => {
      if (!ordered.includes(m)) ordered.push(m);
    });
    return ordered;
  }, [tecnicos]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    let result = tecnicos;

    if (term) {
      result = result.filter((t) => {
        const nombreCompleto = `${t.tecnicoNombre ?? ''} ${t.tecnicoApellido ?? ''}`.toLowerCase();
        const esp = (t.especialidad ?? '').toLowerCase();
        return nombreCompleto.includes(term) || esp.includes(term);
      });
    }

    if (filterMotivo) {
      result = result
        .map((t) => ({
          ...t,
          comentarios: (t.comentarios ?? []).filter((c) => c?.motivo === filterMotivo),
        }))
        .filter((t) => (t.comentarios ?? []).length > 0)
        .map((t) => ({
          ...t,
          totalCalificaciones: t.comentarios.length,
          promedioCalificacion:
            Math.round(
              (t.comentarios.reduce((s, c) => s + (c?.calificacion ?? 0), 0) / t.comentarios.length) * 10
            ) / 10,
        }));
    }

    return result;
  }, [tecnicos, search, filterMotivo]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        if (sortBy === 'rating') return (b.promedioCalificacion ?? 0) - (a.promedioCalificacion ?? 0);
        return (b.totalCalificaciones ?? 0) - (a.totalCalificaciones ?? 0);
      }),
    [filtered, sortBy]
  );

  const tecnicosConCalificacion = filtered.filter((t) => (t.totalCalificaciones ?? 0) > 0);
  const promedioGeneral =
    tecnicosConCalificacion.length > 0
      ? Math.round(
          (tecnicosConCalificacion.reduce((sum, t) => sum + (t.promedioCalificacion ?? 0), 0) /
            tecnicosConCalificacion.length) *
            10
        ) / 10
      : 0;

  const totalComentarios = filtered.reduce((sum, t) => sum + (t.totalCalificaciones ?? 0), 0);

  return (
    <>
      <Header title={pageTitle} subtitle={pageDesc} />
      <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-100">
        {error && (
          <div className="text-red-600 text-sm bg-red-100 border border-red-300 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {loading ? (
          isAdmin ? <CardsGridSkeleton count={4} /> : <TableSkeleton rows={4} showFilters={false} />
        ) : !isAdmin ? (
          miCalificacion ? (
            <VistaTecnicoIndividual tecnico={miCalificacion} />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
              No se pudo obtener tu información de calificaciones.
            </div>
          )
        ) : (
          /* Admin View */
          <>
            {/* Stats summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
                  Promedio General
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {promedioGeneral > 0 ? promedioGeneral.toFixed(1) : '—'}
                  </span>
                  {promedioGeneral > 0 && <StarRating rating={promedioGeneral} size="text-lg" />}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
                  Técnicos en el Equipo
                </p>
                <span className="text-3xl font-extrabold text-slate-900">{filtered.length}</span>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
                  Total Calificaciones
                </p>
                <span className="text-3xl font-extrabold text-slate-900">{totalComentarios}</span>
              </div>
            </div>

            {/* Filter + Sort controls */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1 min-w-[220px]">
                <SearchBar
                  value={search}
                  onSearch={setSearch}
                  placeholder="Buscar técnico por nombre o especialidad..."
                />
              </div>

              <div className="flex items-center gap-2 min-w-[180px]">
                <FontAwesomeIcon icon={faFilter} className="text-slate-400 text-sm shrink-0" />
                <select
                  value={filterMotivo}
                  onChange={(e) => setFilterMotivo(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg bg-white border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 cursor-pointer appearance-none"
                >
                  <option value="">Todos los motivos</option>
                  {motivosPresentes.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                {filterMotivo && (
                  <button
                    type="button"
                    onClick={() => setFilterMotivo('')}
                    className="px-2 py-2 text-xs text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                    title="Limpiar motivo"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <FontAwesomeIcon icon={faArrowDownWideShort} className="text-slate-400 text-sm" />
                <button
                  type="button"
                  onClick={() => setSortBy('rating')}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors cursor-pointer ${
                    sortBy === 'rating'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Mejor calificación
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('count')}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors cursor-pointer ${
                    sortBy === 'count'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Más evaluaciones
                </button>
              </div>

              {(search || filterMotivo) && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); setFilterMotivo(''); }}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Active filters */}
            {(search || filterMotivo) && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-500">Filtros activos:</span>
                {search && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                    Técnico: &quot;{search}&quot;
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="hover:opacity-70 cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                    </button>
                  </span>
                )}
                {filterMotivo && (
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${getMotivoBadgeStyle(filterMotivo)}`}
                  >
                    Motivo: {filterMotivo}
                    <button
                      type="button"
                      onClick={() => setFilterMotivo('')}
                      className="hover:opacity-70 cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20 px-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <FontAwesomeIcon icon={faStarSolid} className="text-2xl text-slate-400" />
                </div>
                <h4 className="text-lg font-semibold text-slate-900 text-center">
                  {search || filterMotivo ? 'Sin resultados' : 'Sin técnicos'}
                </h4>
                <p className="text-sm text-slate-500 mt-2 max-w-md text-center">
                  {search && filterMotivo
                    ? `No se encontraron técnicos que coincidan con "${search}" y el motivo "${filterMotivo}".`
                    : search
                    ? `No se encontró ningún técnico con el nombre o especialidad "${search}".`
                    : filterMotivo
                    ? `No hay técnicos con el motivo "${filterMotivo}".`
                    : 'Aún no hay técnicos registrados en el sistema.'}
                </p>
                {(search || filterMotivo) && (
                  <button
                    type="button"
                    onClick={() => { setSearch(''); setFilterMotivo(''); }}
                    className="mt-4 px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {sorted.map((t) => (
                  <TecnicoCard
                    key={t.tecnicoId}
                    tecnico={t}
                    onViewComments={() => setSelectedTecnico(t)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Comments modal for Admin */}
      {selectedTecnico && (
        <ComentariosModal
          tecnico={selectedTecnico}
          onClose={() => setSelectedTecnico(null)}
        />
      )}
    </>
  );
}
