import { useState, useMemo, useEffect } from 'react';
import type { Incident } from '../../types/incident';
import { StatusBadge, PriorityBadge, CategoryLabel, formatDate } from './IncidentBadges';
import SearchBar from '../dashboard/SearchBar';
import { UserCheck, Eye, RefreshCw, ArrowRightLeft, UserPlus, History, Star } from 'lucide-react';
import { getCurrentUser, type UsuarioSession } from '../../utils/auth';

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
  if (targetFilter === 'activas') return !CLOSED_STATUSES.includes(status);
  if (targetFilter === 'cerradas') return CLOSED_STATUSES.includes(status);
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

const selectClass = "px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:border-amber-500";

export default function IncidentsTable({
  incidents, role, onAssign, onView, onViewTraceability, onChangeStatus,
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

  const hasActiveStatus = useMemo(
    () => matchingForStatus.some((i) => !CLOSED_STATUSES.includes(i.status)),
    [matchingForStatus]
  );

  const hasClosedStatus = useMemo(
    () => matchingForStatus.some((i) => CLOSED_STATUSES.includes(i.status)),
    [matchingForStatus]
  );

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
    if (filterStatus === 'activas') {
      if (!hasActiveStatus) setFilterStatus('all');
    } else if (filterStatus === 'cerradas') {
      if (!hasClosedStatus) setFilterStatus('all');
    } else {
      const isAvailable = availableStatuses.some(
        (s) => s === filterStatus || STATUS_SYNONYMS[s]?.includes(filterStatus)
      );
      if (!isAvailable) setFilterStatus('all');
    }
  }, [availableStatuses, filterStatus, hasActiveStatus, hasClosedStatus]);

  useEffect(() => {
    if (filterReassignedOnly && reassignedCount === 0) {
      setFilterReassignedOnly(false);
    }
  }, [filterReassignedOnly, reassignedCount]);

  const hasFilters = search || filterStatus !== 'all' || filterPriority !== 'all' || filterCategory !== 'all' || filterReassignedOnly;

  const clearFilters = () => {
    setSearch(''); setFilterStatus('all'); setFilterPriority('all'); setFilterCategory('all'); setFilterReassignedOnly(false);
  };

  const headers = ['Ticket', 'Título & Ubicación', 'Categoría', 'Prioridad', 'Estado', 'Asignado', 'Fecha'];

  return (
    <div className="bg-white border border-slate-300 rounded-2xl overflow-hidden shadow-sm">
      {/* Filter Bar */}
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <SearchBar value={search} onSearch={setSearch} placeholder="Buscar por ID, título, usuario o técnico..." />
        </div>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectClass}>
          <option value="all">Todos los Estados</option>
          {hasActiveStatus && <option value="activas">Solo Activas</option>}
          {hasClosedStatus && <option value="cerradas">Solo Cerradas</option>}
          {availableStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className={selectClass}>
          <option value="all">Todas las Prioridades</option>
          {availablePriorities.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>

        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={`${selectClass} max-w-[180px] truncate`}>
          <option value="all">Todas las Categorías</option>
          {availableCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>

        {isPrivileged && reassignedCount > 0 && (
          <button type="button" onClick={() => setFilterReassignedOnly((p) => !p)}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              filterReassignedOnly ? 'bg-violet-600 text-white border-violet-600 shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
            }`} title="Filtrar solo incidencias que tuvieron reasignación">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Reasignadas ({reassignedCount})</span>
          </button>
        )}

        {hasFilters && (
          <button type="button" onClick={clearFilters} className="px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer">
            Limpiar
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-y-auto max-h-[520px]">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-slate-100/70 z-10">
            <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              {headers.map((h) => <th key={h} className="px-5 py-3.5">{h}</th>)}
              <th className="px-5 py-3.5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-500">No se encontraron incidencias que coincidan con los filtros.</td></tr>
            ) : filtered.map((incident) => {
              const isPendingReassign = pendingIncidentIds?.has(incident.numericId || 0);
              return (
                <tr key={incident.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-amber-600">{incident.id}</td>

                  <td className="px-5 py-3.5 max-w-xs">
                    <p className="text-slate-900 font-semibold text-sm truncate">{incident.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{incident.location}</p>
                  </td>

                  <td className="px-5 py-3.5"><CategoryLabel category={incident.category} especialidad={incident.especialidad} /></td>
                  <td className="px-5 py-3.5"><PriorityBadge priority={incident.priority} /></td>

                  <td className="px-5 py-3.5">
                    <div className="flex flex-col gap-1 items-start">
                      <StatusBadge status={incident.status} />
                      {isPendingReassign && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-violet-100 text-violet-800 border border-violet-200" title="Reasignación pendiente">
                          <ArrowRightLeft className="w-2.5 h-2.5" /> Reasignación solicitada
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <AssigneeCell incident={incident} isPrivileged={isPrivileged} />
                  </td>

                  <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{formatDate(incident.createdAt)}</td>

                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    <ActionButtons
                      incident={incident} role={role} usuario={usuario}
                      isPendingReassign={isPendingReassign}
                      onView={onView} onViewTraceability={onViewTraceability}
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

      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>Mostrando {filtered.length} de {incidents.length} incidencias</span>
      </div>
    </div>
  );
}

function AssigneeCell({ incident, isPrivileged }: { incident: Incident; isPrivileged: boolean }) {
  if (incident.assignee === 'Sin asignar') return <span className="text-slate-400 italic font-medium">Sin asignar</span>;

  if (isPrivileged && incident.fueReasignada) {
    return (
      <div className="flex flex-col gap-1 items-start min-w-[150px]">
        {incident.tecnicoAnteriorNombre && incident.tecnicoAnteriorNombre !== incident.assignee ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 line-through text-[11px] font-medium" title={`Original: ${incident.tecnicoAnteriorNombre}`}>{incident.tecnicoAnteriorNombre}</span>
            <span className="text-violet-600 font-bold text-xs" title="Reasignado a">➔</span>
            <span className="font-semibold text-slate-900 text-xs" title={`Actual: ${incident.assignee}`}>{incident.assignee}</span>
          </div>
        ) : (
          <span className="font-semibold text-slate-900 text-xs">{incident.assignee}</span>
        )}
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200 cursor-help"
          title={incident.motivoReasignacion ? `Trazabilidad: ${incident.motivoReasignacion}` : `Reasignado por ${incident.reasignadoPorNombre || 'Soporte'}`}>
          <ArrowRightLeft className="w-2.5 h-2.5 text-violet-600 shrink-0" />
          <span className="truncate max-w-[160px]">{incident.reasignadoPorNombre ? `Por: ${incident.reasignadoPorNombre}` : 'Reasignado'}</span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <span className="font-medium text-slate-700">{incident.assignee}</span>
      {isPrivileged && incident.asignadoPorNombre && incident.asignadoPorNombre !== incident.assignee && (
        <span className="text-[10px] text-slate-400">Asignó: {incident.asignadoPorNombre}</span>
      )}
    </div>
  );
}

function ActionButtons({ incident, role, usuario, isPendingReassign, onView, onViewTraceability, onAssign, onChangeStatus, onRequestReassign, onSelfAssign, onReviewReassignments, onRate }: {
  incident: Incident; role?: string; usuario: UsuarioSession | null; isPendingReassign?: boolean;
  onView: (i: Incident) => void; onViewTraceability?: (i: Incident) => void;
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
      <button type="button" onClick={() => onView(incident)} className={`${btnBase} font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300`} title="Ver detalle">
        <Eye className="w-3.5 h-3.5" />
      </button>

      {onViewTraceability && (
        <button type="button" onClick={() => onViewTraceability(incident)} className={`${btnBase} font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-300 shadow-2xs`} title="Ver trazabilidad">
          <History className="w-3.5 h-3.5" />
        </button>
      )}

      {isAdmin && onAssign && (
        <button type="button" onClick={() => onAssign(incident)} className={`${btnBase} font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300`} title="Asignar técnico">
          <UserCheck className="w-3.5 h-3.5" />
        </button>
      )}

      {onChangeStatus && !isEspecialista && (role === 'ADMIN' || role === 'TECNICO_GENERAL' || role === 'TECNICO') && (
        <button type="button" onClick={() => onChangeStatus(incident)} className={`${btnBase} font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300`} title="Actualizar estado">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      )}

      {isAdmin && onReviewReassignments && isPendingReassign && (
        <button type="button" onClick={onReviewReassignments} className={`${btnBase} font-semibold text-violet-700 bg-violet-100 hover:bg-violet-200 border border-violet-300`} title="Revisar reasignación">
          <ArrowRightLeft className="w-3.5 h-3.5" />
        </button>
      )}

      {onSelfAssign && isEspecialista && (isUnassigned || incident.status === 'Pendiente') && !isClosed && (
        <button type="button" onClick={() => onSelfAssign(incident)} className={`${btnBase} font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 hover:scale-105 active:scale-95 shadow-xs`} title="Autoasignarme">
          <UserPlus className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Tomar</span>
        </button>
      )}

      {onRequestReassign && isEspecialista && (() => {
        const isAssignedToMe = !incident.assigneeId || !usuario?.id ||
          Number(incident.assigneeId) === Number(usuario?.id) ||
          (incident.assignee && usuario?.nombre && incident.assignee.toLowerCase().includes(usuario.nombre.toLowerCase()));
        if (!isAssignedToMe || isClosed || isUnassigned) return null;
        return (
          <button type="button" onClick={isPendingReassign ? undefined : () => onRequestReassign(incident)} disabled={!!isPendingReassign}
            className={`${btnBase} font-semibold border ${isPendingReassign
              ? 'text-violet-700 bg-violet-100 border-violet-300 opacity-80 cursor-not-allowed'
              : 'text-violet-700 bg-violet-50 hover:bg-violet-100 border-violet-300 hover:scale-105 active:scale-95 shadow-xs'}`}
            title={isPendingReassign ? 'Reasignación ya solicitada' : 'Solicitar reasignación'}>
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>
        );
      })()}

      {onRate && canRate && (
        <button type="button" onClick={() => onRate(incident)} className={`${btnBase} font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 hover:scale-105 active:scale-95 shadow-xs`} title="Calificar atención">
          <Star className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Calificar</span>
        </button>
      )}

      {incident.calificacion && (
        <span
          className={`inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-semibold border ${
            incident.calificacion <= 2
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-amber-50 border-amber-200 text-amber-700'
          }`}
          title={`Calificación: ${incident.calificacion}/5${incident.motivoCalificacion ? ` - Motivo: ${incident.motivoCalificacion}` : ''}`}
        >
          {Array.from({ length: incident.calificacion }, (_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                incident.calificacion! <= 2 ? 'fill-red-400 text-red-400' : 'fill-amber-400 text-amber-400'
              }`}
            />
          ))}
        </span>
      )}
    </div>
  );
}
