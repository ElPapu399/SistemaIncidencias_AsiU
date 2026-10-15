import type { LucideIcon } from 'lucide-react';

interface ReportMetricCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  description: string;
  icon: LucideIcon;
  accent: string;
}

export default function ReportMetricCard({ title, value, suffix, description, icon: Icon, accent }: ReportMetricCardProps) {
  return (
    <section aria-label={title} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white ${accent}`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-tight text-slate-900">{value}{suffix && <span className="ml-1 text-sm font-normal text-slate-500">{suffix}</span>}</p>
          <h3 className="mt-1 text-sm font-semibold text-slate-700">{title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
        </div>
      </div>
    </section>
  );
}
