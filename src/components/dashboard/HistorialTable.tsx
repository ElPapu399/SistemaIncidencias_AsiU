import { Eye } from 'lucide-react';
import type { Incident } from '../../types/incident';
import { CategoryLabel, formatDate, PriorityBadge, StatusBadge } from './IncidentBadges';

interface HistorialTableProps {
  incidents: Incident[];
  onView: (incident: Incident) => void;
}

const headers = ['Ticket', 'Título y ubicación', 'Categoría', 'Prioridad', 'Estado', 'Técnico', 'Fecha de registro', 'Acciones'];

export default function HistorialTable({ incidents, onView }: HistorialTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
      <div role="region" aria-label="Historial de incidencias con desplazamiento" tabIndex={0} className="max-h-[min(60dvh,32rem)] overflow-auto overscroll-contain focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600">
        <table className="w-full min-w-225 text-left">
          <caption className="sr-only">Incidencias resueltas o cerradas. La única acción disponible es ver el detalle.</caption>
          <thead className="sticky top-0 z-10 bg-slate-100">
            <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-600">
              {headers.map((header) => <th key={header} scope="col" className={`px-6 py-4 ${header === 'Acciones' ? 'text-center' : ''}`}>{header}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {incidents.length === 0 ? (
              <tr><td colSpan={headers.length} className="px-6 py-12 text-center text-slate-500">Aún no hay incidencias resueltas o cerradas en tu historial.</td></tr>
            ) : incidents.map((incident) => (
              <tr key={incident.id} className="transition-colors hover:bg-slate-50">
                <th scope="row" className="whitespace-nowrap px-6 py-4 font-mono text-xs font-bold text-amber-600">{incident.id}</th>
                <td className="max-w-xs px-6 py-4">
                  <p className="truncate font-semibold text-slate-900" title={incident.title}>{incident.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{incident.location}</p>
                </td>
                <td className="px-6 py-4"><CategoryLabel category={incident.category} especialidad={incident.especialidad} /></td>
                <td className="px-6 py-4"><PriorityBadge priority={incident.priority} /></td>
                <td className="px-6 py-4"><StatusBadge status={incident.status} /></td>
                <td className="px-6 py-4 text-slate-700">{incident.assignee || 'Sin asignar'}</td>
                <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-500">{formatDate(incident.createdAt)}</td>
                <td className="px-6 py-4 text-center">
                  <button type="button" onClick={() => onView(incident)} aria-label={`Ver detalle de ${incident.id}`} className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                    <Eye className="h-4 w-4" aria-hidden="true" />Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-500">Mostrando {incidents.length} incidencia{incidents.length !== 1 ? 's' : ''} del historial</div>
    </div>
  );
}
