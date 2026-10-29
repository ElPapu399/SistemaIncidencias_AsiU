import { Monitor, Pencil, Projector, RefreshCw } from 'lucide-react';
import type { Equipo } from '../../types/equipo';

const estadoClasses: Record<string, string> = {
  Operativo: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  'En reparación': 'border-amber-200 bg-amber-50 text-amber-700',
  Mantenimiento: 'border-blue-200 bg-blue-50 text-blue-700',
  'Dado de baja': 'border-slate-200 bg-slate-100 text-slate-600',
};

interface EquiposTableProps {
  equipos: Equipo[];
  total: number;
  puedeEditar: boolean;
  onEdit: (equipo: Equipo) => void;
  onChangeState: (equipo: Equipo) => void;
}

export default function EquiposTable({ equipos, total, puedeEditar, onEdit, onChangeState }: EquiposTableProps) {
  return (
    <>
      <div role="region" aria-label="Inventario de equipos con desplazamiento" tabIndex={0} className="max-h-[min(60dvh,32rem)] overflow-auto overscroll-contain focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600">
        <table className="w-full min-w-225 text-left text-sm">
          <caption className="sr-only">Equipos registrados en el laboratorio</caption>
          <thead className="sticky top-0 z-10 bg-slate-100 text-xs uppercase tracking-wide text-slate-500"><tr>{['Código', 'Tipo', 'Marca / Modelo', 'N/S', 'Estado', 'Adquisición', ...(puedeEditar ? ['Acciones'] : [])].map((label) => <th key={label} scope="col" className="px-5 py-4 font-semibold">{label}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-200">
            {equipos.length === 0 ? <tr><td colSpan={puedeEditar ? 7 : 6} className="px-5 py-12 text-center text-slate-500">{total === 0 ? 'Este laboratorio aún no tiene equipos registrados.' : 'No se encontraron equipos con los filtros seleccionados.'}</td></tr> : equipos.map((equipo) => {
              const Icon = equipo.tipo.toLowerCase() === 'proyector' ? Projector : Monitor;
              const fecha = equipo.fechaAdquisicion ? new Date(`${equipo.fechaAdquisicion}T12:00:00`) : null;
              return <tr key={equipo.id} className="transition-colors even:bg-slate-50 hover:bg-blue-50/50">
                <th scope="row" className="px-5 py-4"><div className="flex items-center gap-3"><span className="rounded-xl bg-slate-200 p-2 text-slate-500"><Icon className="h-5 w-5" aria-hidden="true" /></span><span className="font-mono text-xs font-bold text-slate-900">{equipo.codigo}</span></div></th>
                <td className="px-5 py-4 text-slate-600">{equipo.tipo === 'PC' ? 'Computadora' : equipo.tipo}</td>
                <td className="px-5 py-4"><p className="font-semibold text-slate-900">{equipo.marca || 'Sin registrar'}</p><p className="text-xs text-slate-500">{equipo.modelo || 'Sin modelo'}</p></td>
                <td className="px-5 py-4 font-mono text-xs text-slate-500">{equipo.numeroSerie || 'Sin registrar'}</td>
                <td className="px-5 py-4"><span className={`inline-flex whitespace-nowrap rounded border px-2 py-1 text-xs font-semibold ${estadoClasses[equipo.estado] ?? estadoClasses['Dado de baja']}`}>{equipo.estado}</span></td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-500">{fecha && Number.isFinite(fecha.getTime()) ? fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Sin registrar'}</td>
                {puedeEditar && <td className="px-5 py-4"><div className="flex items-center gap-2"><button type="button" onClick={() => onEdit(equipo)} title="Editar activo" aria-label={`Editar activo ${equipo.codigo}`} className="cursor-pointer rounded-lg p-2 text-blue-600 hover:bg-blue-100"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => onChangeState(equipo)} title="Cambiar estado" aria-label={`Cambiar estado de ${equipo.codigo}`} className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-200"><RefreshCw className="h-4 w-4" /></button></div></td>}
              </tr>;
            })}
          </tbody>
        </table>
      </div>
      <p className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-500">Mostrando {equipos.length} de {total} equipos</p>
    </>
  );
}
