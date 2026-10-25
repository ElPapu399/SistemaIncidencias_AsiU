import type { ReportChartItem } from '../../utils/reportesCharts';

export default function ReportStatusChart({ items, total }: { items: ReportChartItem[]; total: number }) {
  const radius = 76;
  const circumference = 2 * Math.PI * radius;
  // El desplazamiento acumulado coloca cada segmento después del anterior.
  const segments = items.reduce<{ item: ReportChartItem; start: number }[]>((result, item) => {
    const previous = result.at(-1);
    result.push({ item, start: previous ? previous.start + previous.item.count : 0 });
    return result;
  }, []);

  return (
    <section aria-label="Distribución por estado" className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h3 className="text-base font-semibold text-slate-900">Distribución por estado</h3>
      <p className="mt-1 text-xs text-slate-500">Cantidad y porcentaje de todas las incidencias registradas</p>
      <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row">
        <svg viewBox="0 0 220 220" role="img" aria-label={`Distribución de ${total} incidencias por estado`} className="w-48 shrink-0 sm:w-44 2xl:w-56">
          <title>{items.map((item) => `${item.label}: ${item.count}`).join('; ')}</title>
          <circle cx="110" cy="110" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="26" />
          {total > 0 && segments.filter(({ item }) => item.count > 0).map(({ item, start }) => (
            <circle key={item.label} cx="110" cy="110" r={radius} fill="none" stroke={item.color} strokeWidth="26" strokeDasharray={`${item.count / total * circumference} ${circumference - item.count / total * circumference}`} strokeDashoffset={-start / total * circumference} transform="rotate(-90 110 110)" className="transition-opacity hover:opacity-75">
              <title>{item.label}: {item.count} ({Math.round(item.count / total * 100)}%)</title>
            </circle>
          ))}
          <text x="110" y="108" textAnchor="middle" fontSize="32" fontWeight="700" fill="#0f172a">{total}</text>
          <text x="110" y="130" textAnchor="middle" fontSize="13" fill="#64748b">incidencias</text>
        </svg>
        <ul className="max-h-72 w-full min-w-0 space-y-3 overflow-y-auto overscroll-contain pr-1">
          {items.map((item) => <li key={item.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-slate-700"><span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} /><span className="wrap-anywhere">{item.label}</span></span>
            <span className="shrink-0 text-slate-500">{item.count} ({total > 0 ? Math.round(item.count / total * 100) : 0}%)</span>
          </li>)}
        </ul>
      </div>
      {total === 0 && <p className="mt-3 text-xs text-slate-500">Aún no hay incidencias para calcular la distribución.</p>}
    </section>
  );
}
