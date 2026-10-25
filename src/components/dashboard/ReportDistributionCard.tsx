interface ReportDistributionCardProps {
  title: string;
  items: { label: string; count: number; color: string }[];
  total: number;
  showPercentages?: boolean;
}

export default function ReportDistributionCard({ title, items, total, showPercentages = false }: ReportDistributionCardProps) {
  // Categorías: comparar con la más frecuente. Estados: porcentaje del total.
  const scale = showPercentages ? total : Math.max(0, ...items.map((item) => item.count));

  return (
    <section aria-label={title} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mb-6 mt-1 text-xs text-slate-500">{total} incidencias registradas · barras comparadas con la categoría más frecuente</p>
      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">Aún no hay incidencias registradas para este reporte.</p>
      ) : (
        <ul className="max-h-72 space-y-5 overflow-y-auto overscroll-contain pr-2">
          {items.map((item) => {
            const percentage = total > 0 ? Math.round(item.count / total * 100) : 0;
            const width = scale > 0 ? Math.min(100, item.count / scale * 100) : 0;
            return (
              <li key={item.label}>
                <div className="mb-1.5 flex items-start justify-between gap-4">
                  <span className="min-w-0 wrap-anywhere text-sm font-medium text-slate-800">{item.label}</span>
                  <span className="shrink-0 text-sm text-slate-500">{item.count}{showPercentages ? ` (${percentage}%)` : ''}</span>
                </div>
                <div aria-hidden="true" className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${width}%`, backgroundColor: item.color }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
