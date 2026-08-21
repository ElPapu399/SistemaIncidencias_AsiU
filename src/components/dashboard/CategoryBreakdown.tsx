interface CategoryBreakdownProps {
  items: { label: string; count: number; color: string }[];
  total: number;
}

export default function CategoryBreakdown({ items, total }: CategoryBreakdownProps) {
  return (
    <div className="bg-white backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
      <div className="text-left mb-5">
        <h3 className="text-base font-semibold text-dark">Por categoría</h3>
        <p className="text-xs text-slate-500 mt-0.5">Distribución de incidencias activas</p>
      </div>

      <div className="space-y-4">
        {items.map((item) => {
          const percentage = Math.round((item.count / total) * 100);
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-slate-700">{item.label}</span>
                <span className="text-xs text-slate-500">
                  {item.count} ({percentage}%)
                </span>
              </div>
              <div className="h-2 bg-slate-300 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
