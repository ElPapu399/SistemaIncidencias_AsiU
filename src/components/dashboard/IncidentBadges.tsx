import type { IncidentPriority, IncidentStatus } from '../../types/incident';

const statusConfig: Record<string, { label: string; className: string }> = {
  Pendiente: { label: 'Pendiente', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  Asignada: { label: 'Asignada', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  'En atención': { label: 'En atención', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  'En Proceso': { label: 'En Proceso', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  Resuelta: { label: 'Resuelta', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Resuelto: { label: 'Resuelto', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Cerrada: { label: 'Cerrada', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  Cancelado: { label: 'Cancelado', className: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  Baja: { label: 'Baja', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  Media: { label: 'Media', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  Alta: { label: 'Alta', className: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export function StatusBadge({ status }: { status: IncidentStatus | string }) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${config.className}`}>
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: IncidentPriority | string }) {
  const config = priorityConfig[priority] || {
    label: priority,
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${config.className}`}>
      {config.label}
    </span>
  );
}

export function CategoryLabel({ category, especialidad }: { category: string; especialidad?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-slate-800 font-medium text-xs">{category}</span>
      {especialidad && (
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{especialidad}</span>
      )}
    </div>
  );
}

export function formatDate(isoDate?: string | null) {
  if (!isoDate) return '—';
  try {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}
