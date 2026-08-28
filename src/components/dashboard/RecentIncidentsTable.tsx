import { Link } from 'react-router-dom';
import type { Incident } from '../../types/incident';
import { StatusBadge, PriorityBadge, CategoryLabel, formatDate } from './IncidentBadges';

interface RecentIncidentsTableProps {
  incidents: Incident[];
}

export default function RecentIncidentsTable({ incidents }: RecentIncidentsTableProps) {
  return (
    <div className="bg-white backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
        <div className="text-left">
          <h3 className="text-base font-semibold text-black">Incidencias recientes</h3>
          <p className="text-xs text-slate-500 mt-0.5">Últimas reportadas en el campus</p>
        </div>
        <Link
          to='/dashboard/incidencias'
          className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
        >
          Ver todas →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left bg-slate-200">
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">ID</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Título</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Categoría</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Prioridad</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Asignado</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {incidents.slice(0, 4).map((incident) => (
              <tr
                key={incident.id}
                className="border-b border-slate-800/50 hover:bg-slate-400/30 transition-colors"
              >
                <td className="px-6 py-4 font-mono text-xs text-orange-400">{incident.id}</td>
                <td className="px-6 py-4 text-left">
                  <p className="text-black font-medium max-w-xs truncate">{incident.title}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{incident.location}</p>
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
                <td className="px-6 py-4 text-slate-500">{incident.assignee}</td>
                <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{formatDate(incident.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
