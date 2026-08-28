import type { IncidentPriority, IncidentStatus } from '../../types/incident';

const statusConfig: Record<string, { label: string; className: string }> = {
  Pendiente: { label: 'Pendiente', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  'En Proceso': { label: 'En Proceso', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  Resuelto: { label: 'Resuelto', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  Cancelado: { label: 'Cancelado', className: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  Baja: { label: 'Baja', className: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
  Media: { label: 'Media', className: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
  Alta: { label: 'Alta', className: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
};

export function StatusBadge({ status }: { status: IncidentStatus | string }) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
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
    className: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
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
