import { useState, useEffect, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar as faStarSolid,
  faSpinner,
  faCommentDots,
  faUserShield,
  faQuoteLeft,
  faTicket,
  faXmark,
  faFilter,
  faArrowDownWideShort,
} from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import Header from '../components/dashboard/Header';
import SearchBar from '../components/dashboard/SearchBar';
import type { TecnicoCalificacion, ComentarioCalificacion } from '../services/incidenciasService';
import { obtenerCalificacionesTecnicos } from '../services/incidenciasService';

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

function StarRating({ rating, size = 'text-base' }: { rating: number; size?: string }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(
        <FontAwesomeIcon key={i} icon={faStarSolid} className={`${size} text-amber-400`} />
      );
    } else if (i - rating < 1 && i - rating > 0) {
      stars.push(
        <span key={i} className="relative inline-block">
          <FontAwesomeIcon icon={faStarRegular} className={`${size} text-amber-400`} />
          <span
            className="absolute left-0 top-0 overflow-hidden"
            style={{ width: `${(rating % 1) * 100}%` }}
          >
            <FontAwesomeIcon icon={faStarSolid} className={`${size} text-amber-400`} />
          </span>
        </span>
      );
    } else {
      stars.push(
        <FontAwesomeIcon key={i} icon={faStarRegular} className={`${size} text-slate-300`} />
      );
    }
  }
  return <span className="inline-flex items-center gap-0.5">{stars}</span>;
}

function getRatingColor(rating: number): string {
  if (rating >= 4.5) return 'from-emerald-500 to-green-600';
  if (rating >= 3.5) return 'from-blue-500 to-indigo-600';
  if (rating >= 2.5) return 'from-amber-500 to-orange-600';
  return 'from-red-500 to-rose-600';
}

function getRatingBg(rating: number): string {
  if (rating >= 4.5) return 'bg-emerald-50 border-emerald-200';
  if (rating >= 3.5) return 'bg-blue-50 border-blue-200';
  if (rating >= 2.5) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getMotivoBadgeStyle(motivo: string): string {
  const negativos = [
    'Problema no solucionado',
    'Demasiado tiempo de espera',
    'Mala atención o trato',
    'Falta de comunicación',
    'Solución incompleta',
  ];
  if (negativos.includes(motivo)) return 'bg-red-50 text-red-700 border-red-200';
  if (motivo === 'Otro motivo') return 'bg-slate-100 text-slate-600 border-slate-200';
  return 'bg-emerald-50 text-emerald-700 border-emerald-200';
}

/* ─── Comments Modal ─── */
function ComentariosModal({
  tecnico,
  onClose,
}: {
  tecnico: TecnicoCalificacion;
  onClose: () => void;
}) {
  const comentariosOrdenados = useMemo(
    () =>
      [...tecnico.comentarios].sort((a, b) => {
        const da = a.fechaCierre ? new Date(a.fechaCierre).getTime() : 0;
        const db = b.fechaCierre ? new Date(b.fechaCierre).getTime() : 0;
        return db - da;
      }),
    [tecnico.comentarios]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col z-10 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl bg-linear-to-br ${getRatingColor(tecnico.promedioCalificacion)} flex items-center justify-center shadow-md`}
              >
                <span className="text-white text-sm font-bold">
                  {tecnico.tecnicoNombre.charAt(0)}
                  {tecnico.tecnicoApellido.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {tecnico.tecnicoNombre} {tecnico.tecnicoApellido}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <StarRating rating={tecnico.promedioCalificacion} size="text-xs" />
                  <span className="text-xs text-slate-500 font-semibold">
                    {tecnico.promedioCalificacion}/5 · {tecnico.totalCalificaciones} reseña
                    {tecnico.totalCalificaciones !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {comentariosOrdenados.map((c) => (
            <ComentarioItem key={c.incidenciaId} comentario={c} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ComentarioItem({ comentario }: { comentario: ComentarioCalificacion }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">
              {comentario.estudianteNombre.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {comentario.estudianteNombre}
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

/* ─── Technician Card ─── */
function TecnicoCard({
  tecnico,
  onViewComments,
}: {
  tecnico: TecnicoCalificacion;
  onViewComments: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-xl bg-linear-to-br ${getRatingColor(tecnico.promedioCalificacion)} flex items-center justify-center shadow-lg shrink-0`}
          >
            <span className="text-white text-xl font-bold">
              {tecnico.tecnicoNombre.charAt(0)}
              {tecnico.tecnicoApellido.charAt(0)}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 truncate">
              {tecnico.tecnicoNombre} {tecnico.tecnicoApellido}
            </h3>

            {tecnico.especialidad && (
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full mt-0.5">
                <FontAwesomeIcon icon={faUserShield} className="text-[10px]" />
                {tecnico.especialidad}
              </span>
            )}

            <div className="flex items-center gap-3 mt-2">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getRatingBg(tecnico.promedioCalificacion)}`}
              >
                <span className="text-2xl font-extrabold text-slate-800">
                  {tecnico.promedioCalificacion}
                </span>
                <div className="flex flex-col">
                  <StarRating rating={tecnico.promedioCalificacion} size="text-sm" />
                  <span className="text-[11px] text-slate-500 font-medium">
                    {tecnico.totalCalificaciones} calificación
                    {tecnico.totalCalificaciones !== 1 ? 'es' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {tecnico.comentarios.length > 0 && (
        <div className="border-t border-slate-100">
          <button
            type="button"
            onClick={onViewComments}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faCommentDots} className="text-blue-400" />
            Ver {tecnico.comentarios.length} comentario
            {tecnico.comentarios.length !== 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─── */
export default function CalificacionesTecnicosPage({
  title = 'Calificaciones de Técnicos',
  description = 'Consulta el desempeño y los comentarios de los técnicos de soporte.',
}: CalificacionesTecnicosPageProps) {
  const [tecnicos, setTecnicos] = useState<TecnicoCalificacion[]>([]);
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
      const data = await obtenerCalificacionesTecnicos();
      setTecnicos(data);
    } catch {
      setError('No se pudieron cargar las calificaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Collect all unique motivos present in the data
  const motivosPresentes = useMemo(() => {
    const set = new Set<string>();
    tecnicos.forEach((t) =>
      t.comentarios.forEach((c) => {
        if (c.motivo) set.add(c.motivo);
      })
    );
    // Return in predefined order first, then any custom ones
    const ordered = MOTIVOS_PREDETERMINADOS.filter((m) => set.has(m));
    set.forEach((m) => {
      if (!ordered.includes(m)) ordered.push(m);
    });
    return ordered;
  }, [tecnicos]);

  // Filter technicians by search (name / specialty) and selected motivo
  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    let result = tecnicos;

    if (term) {
      result = result.filter((t) => {
        const nombreCompleto = `${t.tecnicoNombre} ${t.tecnicoApellido}`.toLowerCase();
        const esp = (t.especialidad ?? '').toLowerCase();
        return nombreCompleto.includes(term) || esp.includes(term);
      });
    }

    if (filterMotivo) {
      result = result
        .map((t) => ({
          ...t,
          comentarios: t.comentarios.filter((c) => c.motivo === filterMotivo),
        }))
        .filter((t) => t.comentarios.length > 0)
        .map((t) => ({
          ...t,
          totalCalificaciones: t.comentarios.length,
          promedioCalificacion:
            Math.round(
              (t.comentarios.reduce((s, c) => s + c.calificacion, 0) / t.comentarios.length) * 10
            ) / 10,
        }));
    }

    return result;
  }, [tecnicos, search, filterMotivo]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        if (sortBy === 'rating') return b.promedioCalificacion - a.promedioCalificacion;
        return b.totalCalificaciones - a.totalCalificaciones;
      }),
    [filtered, sortBy]
  );

  const promedioGeneral =
    filtered.length > 0
      ? Math.round(
          (filtered.reduce((sum, t) => sum + t.promedioCalificacion, 0) / filtered.length) * 10
        ) / 10
      : 0;

  const totalComentarios = filtered.reduce((sum, t) => sum + t.totalCalificaciones, 0);

  return (
    <>
      <Header title={title} subtitle={description} />
      <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-200">
        {/* Stats summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
              Promedio General
            </p>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-extrabold text-slate-900">
                {promedioGeneral || '—'}
              </span>
              {promedioGeneral > 0 && <StarRating rating={promedioGeneral} size="text-lg" />}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
              Técnicos Evaluados
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
          {/* Search bar */}
          <div className="flex-1 min-w-[220px]">
            <SearchBar
              value={search}
              onSearch={setSearch}
              placeholder="Buscar técnico por nombre o especialidad..."
            />
          </div>

          {/* Motivo filter */}
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

          {/* Sort buttons */}
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

        {/* Active filter indicator */}
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

        {error && (
          <div className="text-red-600 text-sm bg-red-100 border border-red-300 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-slate-400" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <FontAwesomeIcon icon={faStarSolid} className="text-2xl text-slate-400" />
            </div>
            <h4 className="text-lg font-semibold text-slate-900 text-center">
              {search || filterMotivo ? 'Sin resultados' : 'Sin calificaciones'}
            </h4>
            <p className="text-sm text-slate-500 mt-2 max-w-md text-center">
              {search && filterMotivo
                ? `No se encontraron técnicos que coincidan con "${search}" y el motivo "${filterMotivo}".`
                : search
                ? `No se encontró ningún técnico con el nombre o especialidad "${search}".`
                : filterMotivo
                ? `No hay técnicos con el motivo "${filterMotivo}".`
                : 'Aún no hay técnicos calificados. Las calificaciones aparecen al cerrar incidencias.'}
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
      </main>

      {/* Comments modal */}
      {selectedTecnico && (
        <ComentariosModal
          tecnico={selectedTecnico}
          onClose={() => setSelectedTecnico(null)}
        />
      )}
    </>
  );
}
