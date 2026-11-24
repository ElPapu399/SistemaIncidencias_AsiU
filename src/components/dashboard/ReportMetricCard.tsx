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
    <section aria-label={title} className="min-w-0 rounded-2xl border border-(--border-color) bg-(--surface) p-5">
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white ${accent}`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-tight text-(--text-primary)">{value}{suffix && <span className="ml-1 text-sm font-normal text-(--text-secondary)">{suffix}</span>}</p>
          <h3 className="mt-1 text-sm font-semibold text-(--text-primary)">{title}</h3>
          <p className="hidden lg:block mt-1 text-xs leading-relaxed text-(--text-secondary)">{description}</p>
        </div>
      </div>
    </section>
  );
}
