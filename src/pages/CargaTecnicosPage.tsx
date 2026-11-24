import Button from '../components/Button';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsersGear,
  faCircleCheck,
  faTriangleExclamation,
  faCircleExclamation,
  faClipboardList,
  faRotateRight,
  faLaptop,
  faLocationDot,
} from '@fortawesome/free-solid-svg-icons';
import { Search, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import Header from '../components/dashboard/Header';
import IncidentDetailModal from '../components/dashboard/IncidentDetailModal';
import { CardsGridSkeleton } from '../components/dashboard/SkeletonLoaders';
import { PriorityBadge, StatusBadge } from '../components/dashboard/IncidentBadges';
import {
  obtenerTecnicosPorEspecialidad,
  obtenerIncidencias,
} from '../services/incidenciasService';
import type { Tecnico, Incident } from '../types/incident';
import { getCurrentUser } from '../utils/auth';

const CLOSED_STATUSES = new Set(['Resuelta', 'Resuelto', 'Cerrada', 'Cancelado']);

type LoadFilter = 'all' | 'disponible' | 'media' | 'saturado';

function getLoadInfo(count: number) {
  if (count <= 2) {
    return {
      key: 'disponible' as const,
      label: 'Disponible',
      badgeClass: 'bg-(--tone-emerald-bg-50) text-(--tone-emerald-text-700) border-(--tone-emerald-border-200)',
      dotClass: 'bg-emerald-500',
      barColor: 'bg-emerald-500',
      recommendation: 'Capacidad óptima para recibir nuevos tickets.',
    };
  }
  if (count <= 4) {
    return {
      key: 'media' as const,
      label: 'Carga media',
      badgeClass: 'bg-(--tone-amber-bg-50) text-(--tone-amber-text-700) border-(--tone-amber-border-200)',
      dotClass: 'bg-amber-500',
      barColor: 'bg-amber-500',
      recommendation: 'Atención en curso. Asignar solo si coincide especialidad.',
    };
  }
  return {
    key: 'saturado' as const,
    label: 'Saturado',
    badgeClass: 'bg-(--tone-rose-bg-50) text-(--tone-rose-text-700) border-(--tone-rose-border-200)',
    dotClass: 'bg-rose-500 animate-pulse',
    barColor: 'bg-rose-500',
    recommendation: 'Evitar nuevas asignaciones para prevenir demoras.',
  };
}

export default function CargaTecnicosPage() {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [incidencias, setIncidencias] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterEspecialidad, setFilterEspecialidad] = useState('all');
  const [filterCarga, setFilterCarga] = useState<LoadFilter>('all');
  const [expandedTecnicoId, setExpandedTecnicoId] = useState<number | null>(null);

  // Detail Modal
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const usuario = getCurrentUser();

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tecnicosData, incidenciasData] = await Promise.all([
        obtenerTecnicosPorEspecialidad(),
        obtenerIncidencias(),
      ]);
      setTecnicos(tecnicosData);
      setIncidencias(incidenciasData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar información técnica');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Map technician ID -> active incidents
  const ticketsPorTecnico = useMemo(() => {
    const map = new Map<number, Incident[]>();
    for (const t of tecnicos) {
      map.set(t.id, []);
    }
    for (const inc of incidencias) {
      if (CLOSED_STATUSES.has(inc.status)) continue;
      if (inc.assigneeId && map.has(inc.assigneeId)) {
        map.get(inc.assigneeId)!.push(inc);
      } else if (inc.assignee && inc.assignee !== 'Sin asignar') {
        const found = tecnicos.find(
          (t) => `${t.nombre} ${t.apellido}`.toLowerCase().includes(inc.assignee.toLowerCase())
        );
        if (found) {
          map.get(found.id)!.push(inc);
        }
      }
    }
    return map;
  }, [tecnicos, incidencias]);

  // Overall Stats
  const stats = useMemo(() => {
    let disponibles = 0;
    let medias = 0;
    let saturados = 0;
    let totalActivos = 0;

    for (const t of tecnicos) {
      const activeCount = ticketsPorTecnico.get(t.id)?.length ?? t.incidenciasActivas ?? 0;
      totalActivos += activeCount;
      if (activeCount <= 2) disponibles++;
      else if (activeCount <= 4) medias++;
      else saturados++;
    }

    return {
      total: tecnicos.length,
      disponibles,
      medias,
      saturados,
      totalActivos,
    };
  }, [tecnicos, ticketsPorTecnico]);

  const especialidades = useMemo(() => {
    return Array.from(new Set(tecnicos.map((t) => t.especialidad).filter(Boolean))) as string[];
  }, [tecnicos]);

  // Filtered technicians
  const tecnicosFiltrados = useMemo(() => {
    const query = search.toLowerCase().trim();
    return tecnicos.filter((t) => {
      const activeCount = ticketsPorTecnico.get(t.id)?.length ?? t.incidenciasActivas ?? 0;
      const loadInfo = getLoadInfo(activeCount);

      if (query) {
        const matchesName = `${t.nombre} ${t.apellido}`.toLowerCase().includes(query);
        const matchesEmail = t.correo?.toLowerCase().includes(query);
        const matchesSpec = t.especialidad?.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesSpec) return false;
      }

      if (filterEspecialidad !== 'all' && t.especialidad !== filterEspecialidad) {
        return false;
      }

      if (filterCarga !== 'all' && loadInfo.key !== filterCarga) {
        return false;
      }

      return true;
    });
  }, [tecnicos, ticketsPorTecnico, search, filterEspecialidad, filterCarga]);

  const toggleExpand = (id: number) => {
    setExpandedTecnicoId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <Header
        title="Disponibilidad y Carga Técnica"
        subtitle="Monitoreo operativo para delegar incidencias y balancear la carga de trabajo."
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-(--app-bg)">
        {/* Title bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-left">
            <h3 className="text-2xl font-bold text-(--text-primary)">Monitor de Carga del Equipo</h3>
            <p className="text-xs sm:text-sm text-(--text-secondary) mt-1">
              Consulta en tiempo real la disponibilidad de los técnicos especialistas antes de asignar tickets.
            </p>
          </div>
          <Button variant="neutral" appearance="soft" size="custom"
            type="button"
            onClick={cargarDatos}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
          >
            <FontAwesomeIcon icon={faRotateRight} className={` ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </Button>
        </div>

        {error && (
          <div className="bg-(--tone-red-bg-50) border border-(--tone-red-border-200) text-(--tone-red-text-700) px-4 py-3 rounded-xl text-xs sm:text-sm text-left">
            {error}
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 text-left">
          <div className="bg-(--surface) border border-(--border-color) rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-(--text-secondary)">Técnicos</span>
              <div className="w-8 h-8 rounded-lg bg-(--tone-blue-bg-50) text-(--tone-blue-text-600) flex items-center justify-center text-sm">
                <FontAwesomeIcon icon={faUsersGear} />
              </div>
            </div>
            <p className="text-2xl font-bold text-(--text-primary) mt-2">{stats.total}</p>
            <p className="text-[11px] text-(--text-secondary) mt-0.5">Especialistas registrados</p>
          </div>

          <div className="bg-(--surface) border border-(--border-color) rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-(--tone-emerald-text-700)">Disponibles</span>
              <div className="w-8 h-8 rounded-lg bg-(--tone-emerald-bg-50) text-(--tone-emerald-text-600) flex items-center justify-center text-sm">
                <FontAwesomeIcon icon={faCircleCheck} />
              </div>
            </div>
            <p className="text-2xl font-bold text-(--tone-emerald-text-700) mt-2">{stats.disponibles}</p>
            <p className="text-[11px] text-(--text-secondary) mt-0.5">0 a 2 tickets activos</p>
          </div>

          <div className="bg-(--surface) border border-(--border-color) rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-(--tone-amber-text-700)">Carga Media</span>
              <div className="w-8 h-8 rounded-lg bg-(--tone-amber-bg-50) text-(--tone-amber-text-600) flex items-center justify-center text-sm">
                <FontAwesomeIcon icon={faTriangleExclamation} />
              </div>
            </div>
            <p className="text-2xl font-bold text-(--tone-amber-text-700) mt-2">{stats.medias}</p>
            <p className="text-[11px] text-(--text-secondary) mt-0.5">3 a 4 tickets activos</p>
          </div>

          <div className="bg-(--surface) border border-(--border-color) rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-(--tone-rose-text-700)">Saturados</span>
              <div className="w-8 h-8 rounded-lg bg-(--tone-rose-bg-50) text-(--tone-rose-text-600) flex items-center justify-center text-sm">
                <FontAwesomeIcon icon={faCircleExclamation} />
              </div>
            </div>
            <p className="text-2xl font-bold text-(--tone-rose-text-700) mt-2">{stats.saturados}</p>
            <p className="text-[11px] text-(--text-secondary) mt-0.5">5 o más tickets activos</p>
          </div>

          <div className="bg-(--surface) border border-(--border-color) rounded-2xl p-4 sm:p-5 shadow-xs col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-(--text-secondary)">Tickets Activos</span>
              <div className="w-8 h-8 rounded-lg bg-(--tone-purple-bg-50) text-(--tone-purple-text-600) flex items-center justify-center text-sm">
                <FontAwesomeIcon icon={faClipboardList} />
              </div>
            </div>
            <p className="text-2xl font-bold text-(--text-primary) mt-2">{stats.totalActivos}</p>
            <p className="text-[11px] text-(--text-secondary) mt-0.5">En atención técnica</p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-(--surface) border border-(--border-color) rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-(--text-secondary)" />
            <input
              type="text"
              placeholder="Buscar técnico por nombre, correo o especialidad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-(--surface-subtle) border border-(--border-color) rounded-xl text-xs sm:text-sm text-(--text-primary) focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <select
              aria-label="Filtrar por especialidad"
              value={filterEspecialidad}
              onChange={(e) => setFilterEspecialidad(e.target.value)}
              className="px-3 py-2 bg-(--surface-subtle) border border-(--border-color) rounded-xl text-xs font-medium text-(--text-primary) focus:outline-none focus:border-blue-400 cursor-pointer"
            >
              <option value="all">Todas las especialidades</option>
              {especialidades.map((esp) => (
                <option key={esp} value={esp}>
                  {esp}
                </option>
              ))}
            </select>

            <select
              aria-label="Filtrar por estado de carga"
              value={filterCarga}
              onChange={(e) => setFilterCarga(e.target.value as LoadFilter)}
              className="px-3 py-2 bg-(--surface-subtle) border border-(--border-color) rounded-xl text-xs font-medium text-(--text-primary) focus:outline-none focus:border-blue-400 cursor-pointer"
            >
              <option value="all">Todos los estados de carga</option>
              <option value="disponible">🟢 Disponibles (0-2)</option>
              <option value="media">🟡 Carga media (3-4)</option>
              <option value="saturado">🔴 Saturados (5+)</option>
            </select>
          </div>
        </div>

        {/* Technicians Grid */}
        {loading ? (
          <CardsGridSkeleton count={6} />
        ) : tecnicosFiltrados.length === 0 ? (
          <div className="bg-(--surface) border border-(--border-color) rounded-2xl p-12 text-center text-(--text-secondary) shadow-xs">
            <p className="text-base font-semibold text-(--text-primary)">No se encontraron técnicos</p>
            <p className="text-xs text-(--text-secondary) mt-1">Prueba cambiando o limpiando los filtros de búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {tecnicosFiltrados.map((t) => {
              const assignedTickets = ticketsPorTecnico.get(t.id) || [];
              const activeCount = assignedTickets.length;
              const loadInfo = getLoadInfo(activeCount);
              const isExpanded = expandedTecnicoId === t.id;
              const initials = `${t.nombre?.[0] || 'T'}${t.apellido?.[0] || ''}`.toUpperCase();
              const percent = Math.min(100, Math.round((activeCount / 5) * 100));

              return (
                <div
                  key={t.id}
                  className="bg-(--surface) border border-(--border-color) rounded-2xl p-5 shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between text-left space-y-4"
                >
                  {/* Top card info */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-(--surface-muted) border border-(--border-color) text-(--text-primary) font-bold flex items-center justify-center text-sm shrink-0">
                          {initials}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-(--text-primary) leading-snug">
                            {t.nombre} {t.apellido}
                          </h4>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-(--tone-blue-bg-50) text-(--tone-blue-text-700) border border-(--tone-blue-border-200) mt-1">
                            {t.especialidad || 'Soporte general'}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${loadInfo.badgeClass} shrink-0`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${loadInfo.dotClass}`} />
                        <span>{loadInfo.label}</span>
                      </span>
                    </div>

                    <p className="text-[11px] text-(--text-secondary) mt-2 truncate">{t.correo}</p>

                    {/* Workload Progress Bar */}
                    <div className="mt-4 pt-3 border-t border-(--border-color) space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-(--text-secondary) font-medium">Tickets en curso:</span>
                        <span className="font-bold text-(--text-primary)">
                          {activeCount} <span className="text-(--text-secondary) font-normal">/ 5 máx. sugerido</span>
                        </span>
                      </div>
                      <div className="h-2 w-full bg-(--surface-muted) rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${loadInfo.barColor}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-(--text-secondary) italic pt-0.5">{loadInfo.recommendation}</p>
                    </div>
                  </div>

                  {/* Active tickets preview or accordion */}
                  <div className="pt-3 border-t border-(--border-color)">
                    <Button variant="info" appearance="text" size="custom"
                      type="button"
                      onClick={() => toggleExpand(t.id)}
                      className="w-full flex items-center justify-between text-xs font-semibold transition-colors py-1 cursor-pointer"
                    >
                      <span>
                        {activeCount === 0
                          ? 'Sin tickets asignados'
                          : `${activeCount} ticket${activeCount !== 1 ? 's' : ''} activo${activeCount !== 1 ? 's' : ''}`}
                      </span>
                      {activeCount > 0 && (
                        isExpanded ? <ChevronUp className="w-4 h-4 " /> : <ChevronDown className="w-4 h-4 " />
                      )}
                    </Button>

                    {activeCount === 0 ? (
                      <p className="text-[11px] text-(--text-secondary) mt-1">Listo para recibir nuevas asignaciones.</p>
                    ) : isExpanded ? (
                      <div className="mt-2.5 space-y-2 max-h-56 overflow-y-auto pr-1">
                        {assignedTickets.map((inc) => (
                          <div
                            key={inc.id}
                            className="bg-(--surface-subtle) border border-(--border-color)/80 rounded-xl p-2.5 flex items-start justify-between gap-2 hover:bg-(--surface-muted)/60 transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono text-[10px] font-bold text-(--tone-amber-text-600)">{inc.id}</span>
                                <PriorityBadge priority={inc.priority} />
                                <StatusBadge status={inc.status} />
                              </div>
                              <p className="text-xs font-semibold text-(--text-primary) truncate mt-1">{inc.title}</p>
                              <div className="flex items-center gap-1 text-[10px] text-(--text-secondary) mt-0.5">
                                <FontAwesomeIcon icon={faLocationDot} className="text-[9px]" />
                                <span className="truncate">{inc.location}</span>
                                {inc.equipoCodigo && (
                                  <>
                                    <span>·</span>
                                    <FontAwesomeIcon icon={faLaptop} className="text-[9px]" />
                                    <span>{inc.equipoCodigo}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <Button variant="info" appearance="soft" size="custom"
                              type="button"
                              onClick={() => setSelectedIncident(inc)}
                              className="p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0"
                              title="Ver detalle del ticket"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-1.5 flex items-center gap-1 text-[11px] text-(--text-secondary)">
                        <span>Haz clic para ver los tickets asignados</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Ticket Detail Modal */}
      <IncidentDetailModal
        isOpen={selectedIncident !== null}
        incident={selectedIncident}
        currentUserRole={usuario?.rol}
        currentUserId={usuario?.id}
        onClose={() => setSelectedIncident(null)}
      />
    </>
  );
}

