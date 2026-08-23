import { useState } from 'react';
import type { Incident } from '../../types/incident';
import { StatusBadge, PriorityBadge, CategoryLabel, formatDate } from './IncidentBadges';
import SearchBar from '../dashboard/SearchBar';
import { UserCheck, Eye } from 'lucide-react';

type IncidentStatus = "Pendiente" | "En proceso" | "Resuelta" | "No resuelta";

interface IncidentsTableProps {
  incidents: Incident[];
  role: "ADMIN" | "TECNICO" | "ESTUDIANTE"
  onView: (incident: Incident) => void;
  onAssign?: (incident: Incident) => void;
}

export default function IncidentsTable({ incidents, role, onAssign, onView }: IncidentsTableProps) {

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  return (
    <div className="bg-white backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-700/50 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48">
          <SearchBar value={search} onSearch={setSearch} placeholder="Buscar por ID, título o usuario..."/>
        </div>  
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 text-sm bg-slate-100 border border-border rounded-lg focus:outline-none">
          <option value="all">Estado</option>
          {(["Pendiente", "En proceso", "Resuelta", "No resuelta"] as IncidentStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="px-3 py-2 text-sm bg-slate-100 border border-border rounded-lg focus:outline-none">
          <option value="all">Prioridad</option>
          {["Urgente","Alta", "Media", "Baja"].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
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
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => (
              <tr
                key={incident.id}
                className="group border-b border-slate-800/50 hover:bg-slate-400/30 transition-colors"
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
                <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                  {incident.action}
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onView(incident)} className="p-1.5 rounded-lg hover:bg-accent/10 text-accent transition-colors" title="Ver detalle">
                      <Eye className="w-4 h-4" />
                    </button>
                    {role === "ADMIN" && onAssign && (
                      <button onClick={() => onAssign(incident)} className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors" title="Asignar técnico">
                        <UserCheck className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
