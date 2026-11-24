import Button from '../Button';
import { useState, useMemo, useEffect } from 'react';
import type { Incident } from '../../types/incident';
import { StatusBadge, PriorityBadge, CategoryLabel, formatDate } from './IncidentBadges';
import SearchBar from '../dashboard/SearchBar';
import SortableHeader from '../common/SortableHeader';
import { UserCheck, Eye, RefreshCw, ArrowRightLeft, UserPlus, Star } from 'lucide-react';
import { getCurrentUser, type UsuarioSession } from '../../utils/auth';
import {
  type SortDirection,
  comparePriorities,
  compareDates,
  compareStrings,
  getNextDirection,
} from '../../utils/tableSorting';

const CLOSED_STATUSES = ['Resuelta', 'Resuelto', 'Cerrada', 'Cancelado'];

const STATUS_SYNONYMS: Record<string, string[]> = {
  'En atención': ['En Proceso'], 'En Proceso': ['En atención'],
  'Resuelta': ['Resuelto'], 'Resuelto': ['Resuelta'],
  'Cerrada': ['Cancelado'], 'Cancelado': ['Cerrada'],
};

const STANDARD_STATUSES = ['Pendiente', 'Asignada', 'En atención', 'Resuelta', 'Cerrada'];
const ALL_PRIORITIES = ['Alta', 'Media', 'Baja'];

const matchTerm = (i: Incident, term: string) => {
  if (!term) return true;
  return [i.title, i.id, i.reporter ?? '', i.assignee ?? '', i.tecnicoAnteriorNombre ?? '', i.location ?? '']
    .some((f) => f.toLowerCase().includes(term));
};

const matchStatus = (status: string, targetFilter: string) => {
  if (targetFilter === 'all') return true;
  return status === targetFilter || Boolean(STATUS_SYNONYMS[targetFilter]?.includes(status));
};

const matchPriority = (priority: string, targetPriority: string) => {
  if (targetPriority === 'all') return true;
  return priority === targetPriority;
};

const matchCategory = (category: string, targetCategory: string) => {
  if (targetCategory === 'all') return true;
  return category === targetCategory;
};

const matchReassigned = (fueReasignada: boolean | undefined, reassignedOnly: boolean) => {
  if (!reassignedOnly) return true;
  return Boolean(fueReasignada);
};

interface IncidentsTableProps {
  incidents: Incident[];
  role?: string;
  onView: (incident: Incident) => void;
  onViewTraceability?: (incident: Incident) => void;
  onAssign?: (incident: Incident) => void;
  onChangeStatus?: (incident: Incident) => void;
  onRequestReassign?: (incident: Incident) => void;
  onSelfAssign?: (incident: Incident) => void;
  pendingIncidentIds?: Set<number>;
  onReviewReassignments?: () => void;
  onRate?: (incident: Incident) => void;
}

const selectClass = "px-3 py-2 text-xs font-medium bg-(--surface) border border-(--border-color) rounded-xl text-(--text-primary) focus:outline-none focus:border-amber-500";

export default function IncidentsTable({
  incidents, role, onAssign, onView, onViewTraceability: _onViewTraceability, onChangeStatus,
  onRequestReassign, onSelfAssign, pendingIncidentIds, onReviewReassignments, onRate,
}: IncidentsTableProps) {
  const usuario = getCurrentUser();
  const isPrivileged = role === 'ADMIN' || role === 'TECNICO_GENERAL' || usuario?.rol === 'ADMIN' || usuario?.rol === 'TECNICO_GENERAL';

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterReassignedOnly, setFilterReassignedOnly] = useState(false);

  const term = search.toLowerCase().trim();

  // Opciones disponibles para Categoría (dependientes de los demás filtros)
  const matchingForCategory = useMemo(() => {
    return incidents.filter((i) =>
      matchTerm(i, term) &&
      matchStatus(i.status, filterStatus) &&
      matchPriority(i.priority, filterPriority) &&
      matchReassigned(i.fueReasignada, filterReassignedOnly)
    );
  }, [incidents, term, filterStatus, filterPriority, filterReassignedOnly]);

  const availableCategories = useMemo(() => {
    return [...new Set(matchingForCategory.map((i) => i.category).filter(Boolean))].sort();
  }, [matchingForCategory]);

  // Opciones disponibles para Prioridad (dependientes de los demás filtros)
  const matchingForPriority = useMemo(() => {
    return incidents.filter((i) =>
      matchTerm(i, term) &&
      matchStatus(i.status, filterStatus) &&
      matchCategory(i.category, filterCategory) &&
      matchReassigned(i.fueReasignada, filterReassignedOnly)
    );
  }, [incidents, term, filterStatus, filterCategory, filterReassignedOnly]);

  const availablePriorities = useMemo(() => {
    const existing = new Set(matchingForPriority.map((i) => i.priority).filter(Boolean));
    const standard = ALL_PRIORITIES.filter((p) => existing.has(p as any));
    const others = [...existing].filter((p) => !ALL_PRIORITIES.includes(p));
    return [...standard, ...others];
  }, [matchingForPriority]);

  // Opciones disponibles para Estado (dependientes de los demás filtros)
  const matchingForStatus = useMemo(() => {
    return incidents.filter((i) =>
      matchTerm(i, term) &&
      matchPriority(i.priority, filterPriority) &&
      matchCategory(i.category, filterCategory) &&
      matchReassigned(i.fueReasignada, filterReassignedOnly)
    );
  }, [incidents, term, filterPriority, filterCategory, filterReassignedOnly]);

  const availableStatuses = useMemo(() => {
    const standard = STANDARD_STATUSES.filter((s) =>
      matchingForStatus.some((i) => i.status === s || STATUS_SYNONYMS[s]?.includes(i.status))
    );
    const others = [...new Set(matchingForStatus.map((i) => i.status).filter(Boolean))]
      .filter((s) => !STANDARD_STATUSES.includes(s) && !Object.values(STATUS_SYNONYMS).flat().includes(s));
    return [...standard, ...others];
  }, [matchingForStatus]);

  const reassignedCount = useMemo(() => {
    return incidents.filter((i) =>
      i.fueReasignada &&
      matchTerm(i, term) &&
      matchStatus(i.status, filterStatus) &&
      matchPriority(i.priority, filterPriority) &&
      matchCategory(i.category, filterCategory)
    ).length;
  }, [incidents, term, filterStatus, filterPriority, filterCategory]);

  // Incidencias filtradas finales
  const filtered = useMemo(() => {
    return incidents.filter((i) =>
      matchTerm(i, term) &&
      matchStatus(i.status, filterStatus) &&
      matchPriority(i.priority, filterPriority) &&
      matchCategory(i.category, filterCategory) &&
      matchReassigned(i.fueReasignada, filterReassignedOnly)
    );
  }, [incidents, term, filterStatus, filterPriority, filterCategory, filterReassignedOnly]);

  // Autolimpieza cuando un valor seleccionado deja de existir tras cambiar otro filtro
  useEffect(() => {
    if (filterCategory !== 'all' && !availableCategories.includes(filterCategory)) {
      setFilterCategory('all');
    }
  }, [availableCategories, filterCategory]);

  useEffect(() => {
    if (filterPriority !== 'all' && !availablePriorities.includes(filterPriority)) {
      setFilterPriority('all');
    }
  }, [availablePriorities, filterPriority]);

  useEffect(() => {
    if (filterStatus === 'all') return;
    const isAvailable = availableStatuses.some(
      (s) => s === filterStatus || STATUS_SYNONYMS[s]?.includes(filterStatus)
    );
    if (!isAvailable) setFilterStatus('all');
  }, [availableStatuses, filterStatus]);

  useEffect(() => {
    if (filterReassignedOnly && reassignedCount === 0) {
      setFilterReassignedOnly(false);
    }
  }, [filterReassignedOnly, reassignedCount]);

  const hasFilters = search || filterStatus !== 'all' || filterPriority !== 'all' || filterCategory !== 'all' || filterReassignedOnly;

  const clearFilters = () => {
    setSearch(''); setFilterStatus('all'); setFilterPriority('all'); setFilterCategory('all'); setFilterReassignedOnly(false);
  };

  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: string) => {
    const defaultDir: SortDirection = field === 'createdAt' || field === 'priority' ? 'desc' : 'asc';
    setSortDirection((prevDir) => getNextDirection(sortField, field, prevDir, defaultDir));
    setSortField(field);
  };

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      switch (sortField) {
        case 'id':
          return compareStrings(a.id, b.id, sortDirection);
        case 'title':
          return compareStrings(a.title, b.title, sortDirection);
        case 'category':
          return compareStrings(a.category, b.category, sortDirection);
        case 'priority':
          return comparePriorities(a.priority, b.priority, sortDirection);
        case 'status':
          return compareStrings(a.status, b.status, sortDirection);
        case 'assignee':
          return compareStrings(a.assignee, b.assignee, sortDirection);
        case 'createdAt':
          return compareDates(a.createdAt, b.createdAt, sortDirection);
        default:
          return 0;
      }
    });
  }, [filtered, sortField, sortDirection]);

  return (
    <div className="bg-(--surface) border border-(--border-color) rounded-2xl overflow-hidden shadow-sm">
      {/* Filter Bar */}
      <div className="px-5 py-4 border-b border-(--border-color) bg-(--surface-subtle) flex flex-wrap items-center gap-3">
        <div className="flex w-full min-w-0 flex-none items-center gap-2 lg:w-auto lg:flex-1 lg:min-w-50">
          <div className="min-w-0 flex-1">
            <SearchBar
              value={search}
              onSearch={setSearch}
              placeholder="Buscar por ID, título, usuario o técnico..."
            />
          </div>
          {hasFilters && (
              <Button variant="neutral" appearance="soft" size="custom"
                type="button"
                onClick={clearFilters}
                className="shrink-0 whitespace-nowrap px-3 py-2 text-xs font-semibold border rounded-xl transition-colors cursor-pointer sm:hidden"
              >
                Limpiar
              </Button>
            )}
        </div>

        <div className="flex w-full min-w-0 items-center gap-2 overflow-x-auto overscroll-x-contain pb-2 lg:contents">
          <select aria-label="Filtrar por estado" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${selectClass} shrink-0`}>
            <option value="all">Todos los Estados</option>
            {availableStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select aria-label="Filtrar por prioridad" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className={`${selectClass} shrink-0`}>
            <option value="all">Todas las Prioridades</option>
            {availablePriorities.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>

          <select aria-label="Filtrar por categoría" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={`${selectClass} shrink-0 max-w-45 truncate`}>
            <option value="all">Todas las Categorías</option>
            {availableCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>


        {isPrivileged && reassignedCount > 0 && (
          <button type="button" onClick={() => setFilterReassignedOnly((p) => !p)}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              filterReassignedOnly ? 'bg-violet-600 text-white border-violet-600 shadow-sm' : 'bg-(--surface) text-(--text-primary) hover:bg-(--surface-muted) border-(--border-color)'
            }`} title="Filtrar solo incidencias que tuvieron reasignación">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Reasignadas ({reassignedCount})</span>
          </button>
        )}

        {hasFilters && (
          <Button variant="neutral" appearance="soft" size="custom" type="button" onClick={clearFilters} className="px-3 py-2 text-xs font-semibold border rounded-xl transition-colors cursor-pointer hidden sm:inline-flex">
            Limpiar
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-y-auto max-h-130">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-(--surface-muted)/95 backdrop-blur-sm z-10">
            <tr className="border-b border-(--border-color) text-(--text-secondary) text-xs font-semibold uppercase tracking-wider">
              <SortableHeader label="Ticket" field="id" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-5 py-3.5" activeColorClass="text-(--tone-amber-text-600)" />
              <SortableHeader label="Título & Ubicación" field="title" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-5 py-3.5" activeColorClass="text-(--tone-amber-text-600)" />
              <SortableHeader label="Categoría" field="category" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-5 py-3.5" activeColorClass="text-(--tone-amber-text-600)" />
              <SortableHeader label="Prioridad" field="priority" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-5 py-3.5" activeColorClass="text-(--tone-amber-text-600)" />
              <SortableHeader label="Estado" field="status" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-5 py-3.5" activeColorClass="text-(--tone-amber-text-600)" />
              <SortableHeader label="Asignado" field="assignee" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-5 py-3.5" activeColorClass="text-(--tone-amber-text-600)" />
              <SortableHeader label="Fecha" field="createdAt" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-5 py-3.5" activeColorClass="text-(--tone-amber-text-600)" />
              <th className="px-5 py-3.5 text-center font-semibold text-xs uppercase tracking-wider text-(--text-secondary)">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--border-color) text-xs">
            {sorted.length === 0 ? (
              <tr><td colSpan={8} className="px-6 py-12 text-center text-(--text-secondary)">No se encontraron incidencias que coincidan con los filtros.</td></tr>
            ) : sorted.map((incident) => {
              const isPendingReassign = pendingIncidentIds?.has(incident.numericId || 0);
              return (
                <tr key={incident.id} className="hover:bg-(--surface-subtle)/80 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-(--tone-amber-text-800)">{incident.id}</td>

                  <td className="px-5 py-3.5 max-w-xs">
                    <p className="text-(--text-primary) font-semibold text-sm truncate">{incident.title}</p>
                    <p className="text-[11px] text-(--text-secondary) mt-0.5">{incident.location}</p>
                  </td>

                  <td className="px-5 py-3.5"><CategoryLabel category={incident.category} especialidad={incident.especialidad} /></td>
                  <td className="px-5 py-3.5"><PriorityBadge priority={incident.priority} /></td>

                  <td className="px-5 py-3.5">
                    <div className="flex flex-col gap-1 items-start">
                      <StatusBadge status={incident.status} />
                      {isPendingReassign && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-(--tone-violet-bg-100) text-(--tone-violet-text-800) border border-(--tone-violet-border-200)" title="Reasignación pendiente">
                          <ArrowRightLeft className="w-2.5 h-2.5" /> Reasignación solicitada
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <AssigneeCell incident={incident} isPrivileged={isPrivileged} />
                  </td>

                  <td className="px-5 py-3.5 text-(--text-secondary) whitespace-nowrap">{formatDate(incident.createdAt)}</td>

                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    <ActionButtons
                      incident={incident} role={role} usuario={usuario}
                      isPendingReassign={isPendingReassign}
                      onView={onView}
                      onAssign={onAssign} onChangeStatus={onChangeStatus}
                      onRequestReassign={onRequestReassign} onSelfAssign={onSelfAssign}
                      onReviewReassignments={onReviewReassignments} onRate={onRate}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 bg-(--surface-subtle) border-t border-(--border-color) text-xs text-(--text-secondary) flex items-center justify-between">
        <span>Mostrando {sorted.length} de {incidents.length} incidencias</span>
      </div>
    </div>
  );
}

function AssigneeCell({ incident, isPrivileged }: { incident: Incident; isPrivileged: boolean }) {
  if (incident.assignee === 'Sin asignar') return <span className="text-(--text-secondary) italic font-medium">Sin asignar</span>;

  if (isPrivileged && incident.fueReasignada) {
    return (
      <div className="flex flex-col gap-1 items-start min-w-37.5">
        {incident.tecnicoAnteriorNombre && incident.tecnicoAnteriorNombre !== incident.assignee ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-(--text-secondary) line-through text-[11px] font-medium" title={`Original: ${incident.tecnicoAnteriorNombre}`}>{incident.tecnicoAnteriorNombre}</span>
            <span className="text-(--tone-violet-text-600) font-bold text-xs" title="Reasignado a">➔</span>
            <span className="font-semibold text-(--text-primary) text-xs" title={`Actual: ${incident.assignee}`}>{incident.assignee}</span>
          </div>
        ) : (
          <span className="font-semibold text-(--text-primary) text-xs">{incident.assignee}</span>
        )}
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-(--tone-violet-bg-50) text-(--tone-violet-text-700) border border-(--tone-violet-border-200) cursor-help"
          title={incident.motivoReasignacion ? `Trazabilidad: ${incident.motivoReasignacion}` : `Reasignado por ${incident.reasignadoPorNombre || 'Soporte'}`}>
          <ArrowRightLeft className="w-2.5 h-2.5 text-(--tone-violet-text-600) shrink-0" />
          <span className="truncate max-w-40">{incident.reasignadoPorNombre ? `Por: ${incident.reasignadoPorNombre}` : 'Reasignado'}</span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <span className="font-medium text-(--text-primary)">{incident.assignee}</span>
      {isPrivileged && incident.asignadoPorNombre && incident.asignadoPorNombre !== incident.assignee && (
        <span className="text-[10px] text-(--text-secondary)">Asignó: {incident.asignadoPorNombre}</span>
      )}
    </div>
  );
}

function ActionButtons({ incident, role, usuario, isPendingReassign, onView, onAssign, onChangeStatus, onRequestReassign, onSelfAssign, onReviewReassignments, onRate }: {
  incident: Incident; role?: string; usuario: UsuarioSession | null; isPendingReassign?: boolean;
  onView: (i: Incident) => void;
  onAssign?: (i: Incident) => void; onChangeStatus?: (i: Incident) => void;
  onRequestReassign?: (i: Incident) => void; onSelfAssign?: (i: Incident) => void;
  onReviewReassignments?: () => void; onRate?: (i: Incident) => void;
}) {
  const isAdmin = role === 'ADMIN' || role === 'TECNICO_GENERAL';
  const isEspecialista = role === 'TECNICO_ESPECIALISTA';
  const isClosed = CLOSED_STATUSES.includes(incident.status);
  const isUnassigned = !incident.assigneeId || incident.assignee === 'Sin asignar';
  const isEstudiante = role === 'ESTUDIANTE';
  const canRate = isEstudiante && incident.status === 'Resuelta' && !incident.calificacion;

  const btnBase = "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer";

  return (
    <div className="flex items-center justify-center gap-1.5">
      <Button variant="info" appearance="soft" size="custom" type="button" onClick={() => onView(incident)} className={`${btnBase} font-medium border`} title="Ver detalle">
        <Eye className="w-3.5 h-3.5" />
      </Button>

      {isAdmin && onAssign && (
        <Button variant="assignment" appearance="soft" size="custom" type="button" onClick={() => onAssign(incident)} className={`${btnBase} font-medium border`} title="Asignar técnico">
          <UserCheck className="w-3.5 h-3.5" />
        </Button>
      )}

      {onChangeStatus && !isEspecialista && (role === 'ADMIN' || role === 'TECNICO_GENERAL' || role === 'TECNICO') && (
        <Button variant="success" appearance="soft" size="custom" type="button" onClick={() => onChangeStatus(incident)} className={`${btnBase} font-medium border`} title="Actualizar estado">
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      )}

      {isAdmin && onReviewReassignments && isPendingReassign && (
        <Button variant="assignment" appearance="soft" size="custom" type="button" onClick={onReviewReassignments} className={`${btnBase} font-semibold border`} title="Revisar reasignación">
          <ArrowRightLeft className="w-3.5 h-3.5" />
        </Button>
      )}

      {onSelfAssign && isEspecialista && (isUnassigned || incident.status === 'Pendiente') && !isClosed && (
        <Button variant="assignment" appearance="soft" size="custom" type="button" onClick={() => onSelfAssign(incident)} className={`${btnBase} font-semibold border hover:scale-105 active:scale-95 shadow-xs`} title="Autoasignarme">
          <UserPlus className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Tomar</span>
        </Button>
      )}

      {onRequestReassign && isEspecialista && (() => {
        const isAssignedToMe = !incident.assigneeId || !usuario?.id ||
          Number(incident.assigneeId) === Number(usuario?.id) ||
          (incident.assignee && usuario?.nombre && incident.assignee.toLowerCase().includes(usuario.nombre.toLowerCase()));
        if (!isAssignedToMe || isClosed || isUnassigned) return null;
        return (
          <Button variant="assignment" appearance="soft" size="custom" type="button" onClick={isPendingReassign ? undefined : () => onRequestReassign(incident)} disabled={!!isPendingReassign}
            className={`${btnBase} font-semibold border ${isPendingReassign ? ' opacity-80 cursor-not-allowed' : ' hover:scale-105 active:scale-95 shadow-xs'}`}
            title={isPendingReassign ? 'Reasignación ya solicitada' : 'Solicitar reasignación'}>
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </Button>
        );
      })()}

      {onRate && canRate && (
        <Button variant="info" appearance="soft" size="custom" type="button" onClick={() => onRate(incident)} className={`${btnBase} font-semibold border hover:scale-105 active:scale-95 shadow-xs`} title="Calificar atención">
          <Star className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Calificar</span>
        </Button>
      )}

      {incident.calificacion && (
        <span
          className={`inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-semibold border ${
            incident.calificacion <= 2
              ? 'bg-(--tone-red-bg-50) border-(--tone-red-border-200) text-(--tone-red-text-700)'
              : 'bg-(--tone-amber-bg-50) border-(--tone-amber-border-200) text-(--tone-amber-text-700)'
          }`}
          title={`Calificación: ${incident.calificacion}/5${incident.motivoCalificacion ? ` - Motivo: ${incident.motivoCalificacion}` : ''}`}
        >
          {Array.from({ length: incident.calificacion }, (_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                incident.calificacion! <= 2 ? 'fill-red-400 text-(--tone-red-text-400)' : 'fill-amber-400 text-(--tone-amber-text-400)'
              }`}
            />
          ))}
        </span>
      )}
    </div>
  );
}
