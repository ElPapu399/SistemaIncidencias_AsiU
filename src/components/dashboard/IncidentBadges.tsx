import type { IncidentPriority, IncidentStatus } from '../../types/incident';

const statusConfig: Record<string, { label: string; className: string }> = {
  Pendiente: { label: 'Pendiente', className: 'bg-(--tone-amber-bg-50) text-(--tone-amber-text-700) border-(--tone-amber-border-200)' },
  Asignada: { label: 'Asignada', className: 'bg-(--tone-purple-bg-50) text-(--tone-purple-text-700) border-(--tone-purple-border-200)' },
  'En atención': { label: 'En atención', className: 'bg-(--tone-blue-bg-50) text-(--tone-blue-text-700) border-(--tone-blue-border-200)' },
  'En Proceso': { label: 'En Proceso', className: 'bg-(--tone-blue-bg-50) text-(--tone-blue-text-700) border-(--tone-blue-border-200)' },
  Resuelta: { label: 'Resuelta', className: 'bg-(--tone-emerald-bg-50) text-(--tone-emerald-text-700) border-(--tone-emerald-border-200)' },
  Resuelto: { label: 'Resuelto', className: 'bg-(--tone-emerald-bg-50) text-(--tone-emerald-text-700) border-(--tone-emerald-border-200)' },
  Cerrada: { label: 'Cerrada', className: 'bg-(--surface-muted) text-(--text-secondary) border-(--border-color)' },
  Cancelado: { label: 'Cancelado', className: 'bg-(--surface-muted) text-(--text-secondary) border-(--border-color)' },
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  Baja: { label: 'Baja', className: 'bg-(--surface-muted) text-(--text-secondary) border-(--border-color)' },
  Media: { label: 'Media', className: 'bg-(--tone-amber-bg-50) text-(--tone-amber-text-700) border-(--tone-amber-border-200)' },
  Alta: { label: 'Alta', className: 'bg-(--tone-rose-bg-50) text-(--tone-rose-text-700) border-(--tone-rose-border-200)' },
};

export function StatusBadge({ status }: { status: IncidentStatus | string }) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-(--surface-muted) text-(--text-secondary) border-(--border-color)',
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
    className: 'bg-(--surface-muted) text-(--text-secondary) border-(--border-color)',
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
      <span className="text-(--text-primary) font-medium text-xs">{category}</span>
      {especialidad && (
        <span className="text-[10px] text-(--text-secondary) uppercase tracking-wider">{especialidad}</span>
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
