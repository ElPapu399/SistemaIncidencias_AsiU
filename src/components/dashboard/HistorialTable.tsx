import Button from '../Button';
import { useState, useMemo } from 'react';
import { Eye } from 'lucide-react';
import type { Incident } from '../../types/incident';
import { CategoryLabel, formatDate, PriorityBadge, StatusBadge } from './IncidentBadges';
import SortableHeader from '../common/SortableHeader';
import {
  type SortDirection,
  comparePriorities,
  compareDates,
  compareStrings,
  getNextDirection,
} from '../../utils/tableSorting';

interface HistorialTableProps {
  incidents: Incident[];
  onView: (incident: Incident) => void;
}

export default function HistorialTable({ incidents, onView }: HistorialTableProps) {
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: string) => {
    const defaultDir: SortDirection = field === 'createdAt' || field === 'priority' ? 'desc' : 'asc';
    setSortDirection((prevDir) => getNextDirection(sortField, field, prevDir, defaultDir));
    setSortField(field);
  };

  const sortedIncidents = useMemo(() => {
    return [...incidents].sort((a, b) => {
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
  }, [incidents, sortField, sortDirection]);

  return (
    <div className="overflow-hidden rounded-2xl border border-(--border-color) bg-(--surface) shadow-sm">
      <div role="region" aria-label="Historial de incidencias con desplazamiento" tabIndex={0} className="max-h-[min(60dvh,32rem)] overflow-auto overscroll-contain focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600">
        <table className="w-full min-w-225 text-left">
          <caption className="sr-only">Incidencias resueltas o cerradas. La única acción disponible es ver el detalle.</caption>
          <thead className="sticky top-0 z-10 bg-(--surface-muted)">
            <tr className="border-b border-(--border-color) text-xs font-semibold uppercase tracking-wider text-(--text-secondary)">
              <SortableHeader label="Ticket" field="id" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-6 py-4" activeColorClass="text-(--tone-blue-text-600)" />
              <SortableHeader label="Título y ubicación" field="title" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-6 py-4" activeColorClass="text-(--tone-blue-text-600)" />
              <SortableHeader label="Categoría" field="category" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-6 py-4" activeColorClass="text-(--tone-blue-text-600)" />
              <SortableHeader label="Prioridad" field="priority" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-6 py-4" activeColorClass="text-(--tone-blue-text-600)" />
              <SortableHeader label="Estado" field="status" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-6 py-4" activeColorClass="text-(--tone-blue-text-600)" />
              <SortableHeader label="Técnico" field="assignee" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-6 py-4" activeColorClass="text-(--tone-blue-text-600)" />
              <SortableHeader label="Fecha de registro" field="createdAt" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-6 py-4" activeColorClass="text-(--tone-blue-text-600)" />
              <th scope="col" className="px-6 py-4 text-center font-semibold text-xs uppercase tracking-wider text-(--text-secondary)">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--border-color) text-sm">
            {sortedIncidents.length === 0 ? (
              <tr><td colSpan={8} className="px-6 py-12 text-center text-(--text-secondary)">Aún no hay incidencias resueltas o cerradas en tu historial.</td></tr>
            ) : sortedIncidents.map((incident) => (
              <tr key={incident.id} className="transition-colors hover:bg-(--surface-subtle)">
                <th scope="row" className="whitespace-nowrap px-6 py-4 font-mono text-xs font-bold text-(--tone-amber-text-600)">{incident.id}</th>
                <td className="max-w-xs px-6 py-4">
                  <p className="truncate font-semibold text-(--text-primary)" title={incident.title}>{incident.title}</p>
                  <p className="mt-0.5 text-xs text-(--text-secondary)">{incident.location}</p>
                </td>
                <td className="px-6 py-4"><CategoryLabel category={incident.category} especialidad={incident.especialidad} /></td>
                <td className="px-6 py-4"><PriorityBadge priority={incident.priority} /></td>
                <td className="px-6 py-4"><StatusBadge status={incident.status} /></td>
                <td className="px-6 py-4 text-(--text-primary)">{incident.assignee || 'Sin asignar'}</td>
                <td className="whitespace-nowrap px-6 py-4 text-xs text-(--text-secondary)">{formatDate(incident.createdAt)}</td>
                <td className="px-6 py-4 text-center">
                  <Button variant="info" appearance="soft" size="custom" type="button" onClick={() => onView(incident)} aria-label={`Ver detalle de ${incident.id}`} className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2">
                    <Eye className="h-4 w-4" aria-hidden="true" />Ver detalle
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-(--border-color) bg-(--surface-subtle) px-5 py-3 text-xs text-(--text-secondary)">Mostrando {sortedIncidents.length} incidencia{sortedIncidents.length !== 1 ? 's' : ''} del historial</div>
    </div>
  );
}
