interface CategoryBreakdownProps {
  items: { label: string; count: number; color: string }[];
  total: number;
}

export default function CategoryBreakdown({ items, total }: CategoryBreakdownProps) {
  return (
    <div className="bg-(--surface) backdrop-blur-xl border border-(--border-color) rounded-2xl overflow-hidden shadow-sm p-6">
      <div className="text-left mb-5">
        <h3 className="text-base font-semibold text-(--text-primary)">Por categoría</h3>
        <p className="text-xs text-(--text-secondary) mt-0.5">Distribución de incidencias activas</p>
      </div>

      <div className="space-y-4 overflow-x-auto overflow-y-auto max-h-83">
        {items.map((item) => {
          const percentage = Math.round((item.count / total) * 100);
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-(--text-primary)">{item.label}</span>
                <span className="text-xs text-(--text-secondary)">
                  {item.count} ({percentage}%)
                </span>
              </div>
              <div className="h-2 bg-(--track-color) rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
