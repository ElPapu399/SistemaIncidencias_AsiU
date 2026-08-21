import type { IncidentPriority, IncidentStatus, IncidentCategory } from '../../types/incident';

const statusConfig: Record<IncidentStatus, { label: string; className: string }> = {
  pendiente: { label: 'Pendiente', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  en_proceso: { label: 'En proceso', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  resuelta: { label: 'Resuelta', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  cerrada: { label: 'Cerrada', className: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
};

const priorityConfig: Record<IncidentPriority, { label: string; className: string }> = {
  baja: { label: 'Baja', className: 'bg-slate-500/15 text-slate-400' },
  media: { label: 'Media', className: 'bg-sky-500/15 text-sky-400' },
  alta: { label: 'Alta', className: 'bg-orange-500/15 text-orange-400' },
  urgente: { label: 'Urgente', className: 'bg-rose-500/15 text-rose-400' },
};

const categoryLabels: Record<IncidentCategory, string> = {
  infraestructura: 'Infraestructura',
  tecnologia: 'Tecnología',
  academico: 'Académico',
  servicios: 'Servicios',
  seguridad: 'Seguridad',
};

export function StatusBadge({ status }: { status: IncidentStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${config.className}`}>
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: IncidentPriority }) {
  const config = priorityConfig[priority];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}

export function CategoryLabel({ category }: { category: IncidentCategory }) {
  return <span className="text-slate-500 text-sm">{categoryLabels[category]}</span>;
}

export function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate));
}
