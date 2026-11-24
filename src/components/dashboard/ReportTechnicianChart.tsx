import type { TechnicianPerformance } from '../../utils/reportesCharts';

export default function ReportTechnicianChart({ items }: { items: TechnicianPerformance[] }) {
  return (
    <section aria-label="Rendimiento por técnico" className="min-w-0 rounded-2xl border border-(--border-color) bg-(--surface) p-5 sm:p-6">
      <h3 className="text-base font-semibold text-(--text-primary)">Rendimiento por técnico</h3>
      <p className="mt-1 text-xs text-(--text-secondary)">Resueltas o cerradas / total actualmente asignado a cada técnico</p>
      {items.length === 0 ? <p className="py-12 text-center text-sm text-(--text-secondary)">No hay técnicos registrados ni incidencias asignadas.</p> : (
        <ul className="mt-6 max-h-72 space-y-5 overflow-y-auto overscroll-contain pr-2">
          {items.map((tecnico) => {
            const nombres = tecnico.nombre.trim().split(/\s+/);
            const iniciales = `${nombres[0]?.charAt(0) ?? ''}${nombres.length > 1 ? nombres.at(-1)!.charAt(0) : ''}`.toLocaleUpperCase('es');
            return <li key={tecnico.id} className="flex items-center gap-3">
              <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-950 text-xs font-bold text-white">{iniciales}</span>
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
                  <span className="wrap-anywhere font-semibold text-(--text-primary)">{tecnico.nombre}</span>
                  <span className="text-xs text-(--text-secondary)">{tecnico.total > 0 ? `${tecnico.resueltas}/${tecnico.total}` : 'Sin incidencias'}</span>
                </div>
                <div aria-hidden="true" className="h-2.5 overflow-hidden rounded-full bg-(--surface-hover)">
                  <div className={`h-full rounded-full ${tecnico.porcentaje === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${tecnico.porcentaje}%` }} />
                </div>
              </div>
              <span className="w-11 shrink-0 text-right text-sm font-bold text-(--text-primary)">{tecnico.total > 0 ? `${tecnico.porcentaje}%` : '—'}</span>
            </li>;
          })}
        </ul>
      )}
    </section>
  );
}
