import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface StatCardProps {
  title: string;
  value: number;
  icon: IconDefinition;
  trend?: string;
  accent: string;
}

export default function StatCard({ title, value, icon, trend, accent }: StatCardProps) {
  return (
    <div className="bg-gray-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}>
          <FontAwesomeIcon icon={icon} className="text-lg" />
        </div>
      </div>
      {trend && <p className="text-xs text-slate-500">{trend}</p>}
    </div>
  );
}
