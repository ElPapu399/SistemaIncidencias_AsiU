import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Incident } from '../../types/incident';
import { StatusBadge, PriorityBadge, CategoryLabel, formatDate } from './IncidentBadges';
import { getCurrentUser } from '../../utils/auth';
import SortableHeader from '../common/SortableHeader';
import {
  type SortDirection,
  comparePriorities,
  compareDates,
  compareStrings,
  getNextDirection,
} from '../../utils/tableSorting';

interface RecentIncidentsTableProps {
  incidents: Incident[];
}

export default function RecentIncidentsTable({ incidents }: RecentIncidentsTableProps) {
  const usuario = getCurrentUser();
  const currentUserRole = usuario?.rol;

  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: string) => {
    const defaultDir: SortDirection = field === 'createdAt' || field === 'priority' ? 'desc' : 'asc';
    setSortDirection((prevDir) => getNextDirection(sortField, field, prevDir, defaultDir));
    setSortField(field);
  };

  const visibleIncidents = useMemo(() => {
    return currentUserRole === 'ADMIN' || currentUserRole === 'TECNICO_GENERAL'
      ? incidents
      : currentUserRole === 'ESTUDIANTE'
      ? incidents.filter((i) => i.reporterId === usuario?.id)
      : incidents.filter((i) => i.assigneeId === usuario?.id);
  }, [incidents, currentUserRole, usuario?.id]);

  const sortedIncidents = useMemo(() => {
    return [...visibleIncidents].sort((a, b) => {
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
  }, [visibleIncidents, sortField, sortDirection]);

  return (
    <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="text-left">
          <h3 className="text-base font-semibold text-slate-900">Incidencias recientes</h3>
          <p className="text-xs text-slate-500 mt-0.5">Últimas reportadas en el campus (haz clic en los cabezales para ordenar)</p>
        </div>
        <Link
          to="/dashboard/incidencias"
          className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
        >
          Ver todas →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100">
            <tr className="border-b border-slate-200 text-slate-600">
              <SortableHeader label="ID" field="id" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-6 py-3" activeColorClass="text-amber-600" />
              <SortableHeader label="Título" field="title" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-6 py-3" activeColorClass="text-amber-600" />
              <SortableHeader label="Categoría" field="category" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-6 py-3" activeColorClass="text-amber-600" />
              <SortableHeader label="Prioridad" field="priority" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-6 py-3" activeColorClass="text-amber-600" />
              <SortableHeader label="Estado" field="status" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-6 py-3" activeColorClass="text-amber-600" />
              <SortableHeader label="Asignado" field="assignee" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-6 py-3" activeColorClass="text-amber-600" />
              <SortableHeader label="Fecha" field="createdAt" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-6 py-3" activeColorClass="text-amber-600" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {sortedIncidents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                  No hay incidencias para mostrar.
                </td>
              </tr>
            ) : (
              sortedIncidents.slice(0, 6).map((incident) => (
                <tr
                  key={incident.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-6 py-4 font-mono font-bold text-xs text-amber-600">{incident.id}</td>
                  <td className="px-6 py-4 text-left">
                    <p className="text-slate-900 font-semibold max-w-xs truncate">{incident.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{incident.location}</p>
                  </td>
                  <td className="px-6 py-4">
                    <CategoryLabel category={incident.category} />
                  </td>
                  <td className="px-6 py-4">
                    <PriorityBadge priority={incident.priority} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={incident.status} />
                  </td>
                  <td className="px-6 py-4 text-slate-600">{incident.assignee}</td>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{formatDate(incident.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
