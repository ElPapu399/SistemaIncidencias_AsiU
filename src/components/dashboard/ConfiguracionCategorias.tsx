import { useEffect, useState } from 'react';
import { Pencil, Plus, Tag } from 'lucide-react';
import { guardarCategoria, obtenerCatalogoConfiguracion } from '../../services/configuracionService';
import type { CategoriaConfiguracion, CategoriaFormulario } from '../../services/configuracionService';
import CategoriaForm from './CategoriaForm';

const prioridadClases: Record<string, string> = {
  Alta: 'border-red-200 bg-red-50 text-red-700',
  Media: 'border-amber-200 bg-amber-50 text-amber-700',
  Baja: 'border-slate-200 bg-slate-50 text-slate-600',
};

export default function ConfiguracionCategorias() {
  const [catalogo, setCatalogo] = useState<Awaited<ReturnType<typeof obtenerCatalogoConfiguracion>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [intento, setIntento] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [seleccionada, setSeleccionada] = useState<CategoriaConfiguracion | null>(null);

  useEffect(() => {
    let ignore = false;
    obtenerCatalogoConfiguracion()
      .then((datos) => { if (!ignore) setCatalogo(datos); })
      .catch((err: unknown) => { if (!ignore) setError(err instanceof Error ? err.message : 'No se pudieron cargar las categorías.'); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [intento]);

  async function handleSave(datos: CategoriaFormulario, id?: number) {
    const categoria = await guardarCategoria(datos, id);
    setCatalogo((actual) => actual && ({ ...actual, categorias: id === undefined
      ? [...actual.categorias, categoria]
      : actual.categorias.map((item) => item.id === id ? categoria : item) }));
    setMensaje(id === undefined ? 'Categoría creada correctamente.' : 'Categoría actualizada correctamente.');
  }

  if (loading) return <p role="status" className="text-sm text-slate-500">Cargando categorías…</p>;
  if (error) return (
    <div role="alert" className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <p>{error}</p>
      <button type="button" onClick={() => { setError(''); setLoading(true); setIntento((value) => value + 1); }} className="cursor-pointer font-semibold underline">Reintentar</button>
    </div>
  );
  if (!catalogo) return null;

  const canEdit = catalogo.especialidades.length > 0 && catalogo.prioridades.length > 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Catálogo de Categorías de Incidencias</h3>
          <p className="mt-1 text-sm text-slate-500">{catalogo.categorias.length} categoría{catalogo.categorias.length !== 1 ? 's' : ''} configurada{catalogo.categorias.length !== 1 ? 's' : ''}</p>
        </div>
        <button type="button" disabled={!canEdit} onClick={() => { setSeleccionada(null); setMensaje(''); setFormOpen(true); }} className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
          <Plus className="h-5 w-5" aria-hidden="true" />Nueva categoría
        </button>
      </div>
      <p role="status" className="text-sm text-emerald-700">{mensaje}</p>
      {!canEdit && <p className="text-sm text-amber-700">Se necesitan especialidades y prioridades registradas para crear o editar categorías.</p>}
      {catalogo.categorias.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">Aún no hay categorías registradas.</p> : (
        <div role="region" aria-label="Tabla de categorías con desplazamiento" tabIndex={0} className="max-h-[min(55dvh,28rem)] overflow-auto overscroll-contain rounded-xl border border-slate-200 [scrollbar-gutter-stable] focus-visible:outline-2 focus-visible:outline-blue-600">
          <table className="w-full min-w-175 text-left text-sm">
            <caption className="sr-only">Categorías con su especialidad, prioridad base y total de incidencias vinculadas</caption>
            <thead className="sticky top-0 z-10 bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {['Nombre', 'Especialidad', 'Prioridad base', 'Tickets vinculados', 'Acciones'].map((label) => <th key={label} scope="col" className="px-5 py-4 font-semibold">{label}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {catalogo.categorias.map((categoria) => (
                <tr key={categoria.id}>
                  <th scope="row" className="px-5 py-5 font-semibold text-slate-900"><span className="flex items-center gap-3"><Tag className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />{categoria.nombre}</span></th>
                  <td className="px-5 py-5 text-slate-500">{categoria.especialidad?.nombre ?? 'Sin especialidad'}</td>
                  <td className="px-5 py-5"><span className={`inline-flex whitespace-nowrap rounded border px-2 py-1 text-xs font-semibold ${prioridadClases[categoria.prioridadDefecto?.nivel ?? ''] ?? prioridadClases.Baja}`}>{categoria.prioridadDefecto?.nivel ?? 'Sin definir'}</span></td>
                  <td className="px-5 py-5 text-center font-semibold text-slate-900">{categoria.ticketsVinculados}</td>
                  <td className="px-5 py-5"><button type="button" disabled={!canEdit} onClick={() => { setSeleccionada(categoria); setMensaje(''); setFormOpen(true); }} aria-label={`Editar categoría ${categoria.nombre}`} className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"><Pencil className="h-5 w-5" aria-hidden="true" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {formOpen && <CategoriaForm categoria={seleccionada} especialidades={catalogo.especialidades} prioridades={catalogo.prioridades} onSave={handleSave} onClose={() => setFormOpen(false)} />}
    </div>
  );
}
