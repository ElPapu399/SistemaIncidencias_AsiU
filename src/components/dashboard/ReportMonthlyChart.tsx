import type { ReportMonth } from '../../utils/reportesCharts';

export default function ReportMonthlyChart({ meses }: { meses: ReportMonth[] }) {
  const max = Math.max(0, ...meses.map((mes) => mes.count));
  const step = Math.max(1, Math.ceil(max / 4));
  const ceiling = step * 4;
  const plotHeight = 192;
  const baseline = 220;
  const slot = 500 / meses.length;

  return (
    <section aria-label="Incidencias por mes" className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h3 className="text-base font-semibold text-slate-900">Incidencias por mes (últimos 6 meses)</h3>
      <p className="mt-1 text-xs text-slate-500">Fecha de registro · incluye el mes actual · hora de Lima</p>
      <div className="my-auto pt-5">
        <svg viewBox="0 0 560 260" role="img" aria-label="Cantidad de incidencias registradas en los últimos seis meses" className="w-full">
          <title>{meses.map((mes) => `${mes.fullLabel}: ${mes.count}`).join('; ')}</title>
          {[0, 1, 2, 3, 4].map((index) => {
            const y = baseline - index / 4 * plotHeight;
            return <g key={index}>
              <line x1="42" x2="548" y1={y} y2={y} stroke="#e2e8f0" strokeDasharray={index === 0 ? undefined : '4 4'} />
              <text x="32" y={y + 4} textAnchor="end" fontSize="12" fill="#64748b">{index * step}</text>
            </g>;
          })}
          {meses.map((mes, index) => {
            const x = 46 + index * slot + 8;
            const height = mes.count / ceiling * plotHeight;
            return <g key={mes.key}>
              <rect x={x} y={baseline - height} width={slot - 16} height={height} rx="5" fill="#2563eb" className="transition-colors hover:fill-blue-500">
                <title>{mes.fullLabel}: {mes.count} incidencias</title>
              </rect>
              <text x={x + (slot - 16) / 2} y={baseline - height - 8} textAnchor="middle" fontSize="13" fontWeight="600" fill="#334155">{mes.count}</text>
              <text x={x + (slot - 16) / 2} y="246" textAnchor="middle" fontSize="12" fill="#64748b">{mes.label}</text>
            </g>;
          })}
        </svg>
        <table className="sr-only"><caption>Incidencias por mes</caption><thead><tr><th scope="col">Mes</th><th scope="col">Incidencias</th></tr></thead><tbody>{meses.map((mes) => <tr key={mes.key}><th scope="row">{mes.fullLabel}</th><td>{mes.count}</td></tr>)}</tbody></table>
        {max === 0 && <p className="mt-2 text-center text-xs text-slate-500">No hay incidencias registradas en este período.</p>}
      </div>
    </section>
  );
}
