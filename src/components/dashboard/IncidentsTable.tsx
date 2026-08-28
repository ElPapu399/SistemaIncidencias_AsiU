import { useState, useMemo } from 'react';
import type { Incident } from '../../types/incident';
import { StatusBadge, PriorityBadge, CategoryLabel, formatDate } from './IncidentBadges';
import SearchBar from '../dashboard/SearchBar';
import { UserCheck, Eye, RefreshCw } from 'lucide-react';

interface IncidentsTableProps {
  incidents: Incident[];
  role?: string;
  onView: (incident: Incident) => void;
  onAssign?: (incident: Incident) => void;
  onChangeStatus?: (incident: Incident) => void;
}

export default function IncidentsTable({
  incidents,
  role,
  onAssign,
  onView,
  onChangeStatus,
}: IncidentsTableProps) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Dynamic unique categories from real data
  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    incidents.forEach((i) => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set).sort();
  }, [incidents]);

  const filtered = incidents.filter((i) => {
    const matchesStatus = filterStatus === 'all' || i.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || i.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || i.category === filterCategory;

    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      i.title.toLowerCase().includes(term) ||
      i.id.toLowerCase().includes(term) ||
      (i.reporter ?? '').toLowerCase().includes(term) ||
      (i.assignee ?? '').toLowerCase().includes(term) ||
      (i.location ?? '').toLowerCase().includes(term);

    return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
  });

  const clearFilters = () => {
    setSearch('');
    setFilterStatus('all');
    setFilterPriority('all');
    setFilterCategory('all');
  };

  return (
    <div className="bg-white border border-slate-300 rounded-2xl overflow-hidden shadow-sm">
      {/* Filter Bar */}
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <SearchBar
            value={search}
            onSearch={setSearch}
            placeholder="Buscar por ID, título, usuario o ubicación..."
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:border-amber-500"
        >
          <option value="all">Todos los Estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="En Proceso">En Proceso</option>
          <option value="Resuelto">Resuelto</option>
          <option value="Cancelado">Cancelado</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:border-amber-500"
        >
          <option value="all">Todas las Prioridades</option>
          <option value="Alta">Alta</option>
          <option value="Media">Media</option>
          <option value="Baja">Baja</option>
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:border-amber-500 max-w-[180px] truncate"
        >
          <option value="all">Todas las Categorías</option>
          {uniqueCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {(search || filterStatus !== 'all' || filterPriority !== 'all' || filterCategory !== 'all') && (
          <button
            type="button"
            onClick={clearFilters}
            className="px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <th className="px-5 py-3.5">Ticket</th>
              <th className="px-5 py-3.5">Título & Ubicación</th>
              <th className="px-5 py-3.5">Categoría</th>
              <th className="px-5 py-3.5">Prioridad</th>
              <th className="px-5 py-3.5">Estado</th>
              <th className="px-5 py-3.5">Asignado</th>
              <th className="px-5 py-3.5">Fecha</th>
              <th className="px-5 py-3.5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                  No se encontraron incidencias que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              filtered.map((incident) => (
                <tr
                  key={incident.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {/* Ticket code */}
                  <td className="px-5 py-3.5 font-mono font-bold text-amber-600">
                    {incident.id}
                  </td>

                  {/* Title & Location */}
                  <td className="px-5 py-3.5 max-w-xs">
                    <p className="text-slate-900 font-semibold text-sm truncate">{incident.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{incident.location}</p>
                  </td>

                  {/* Category */}
                  <td className="px-5 py-3.5">
                    <CategoryLabel category={incident.category} especialidad={incident.especialidad} />
                  </td>

                  {/* Priority */}
                  <td className="px-5 py-3.5">
                    <PriorityBadge priority={incident.priority} />
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5">
                    <StatusBadge status={incident.status} />
                  </td>

                  {/* Assignee */}
                  <td className="px-5 py-3.5">
                    <span
                      className={`font-medium ${
                        incident.assignee === 'Sin asignar' ? 'text-slate-400 italic' : 'text-slate-700'
                      }`}
                    >
                      {incident.assignee}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                    {formatDate(incident.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Ver detalle */}
                      <button
                        type="button"
                        onClick={() => onView(incident)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
                        title="Ver detalle de la incidencia"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver</span>
                      </button>

                      {/* Asignar técnico (solo ADMIN) */}
                      {role === 'ADMIN' && onAssign && (
                        <button
                          type="button"
                          onClick={() => onAssign(incident)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-colors cursor-pointer"
                          title="Asignar técnico"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Asignar</span>
                        </button>
                      )}

                      {/* Cambiar estado directo (para TECNICO o ADMIN) */}
                      {onChangeStatus && (role === 'TECNICO' || role === 'ADMIN') && (
                        <button
                          type="button"
                          onClick={() => onChangeStatus(incident)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors cursor-pointer"
                          title="Actualizar estado / Solución"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Estado</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>Mostrando {filtered.length} de {incidents.length} incidencias</span>
      </div>
    </div>
  );
}
