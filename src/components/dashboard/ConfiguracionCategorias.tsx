import Button from '../Button';
import { useEffect, useState, useMemo } from 'react';
import { Pencil, Plus, Tag } from 'lucide-react';
import { guardarCategoria, obtenerCatalogoConfiguracion } from '../../services/configuracionService';
import type { CategoriaConfiguracion, CategoriaFormulario } from '../../services/configuracionService';
import CategoriaForm from './CategoriaForm';
import { TableSkeleton } from './SkeletonLoaders';
import SortableHeader from '../common/SortableHeader';
import {
  type SortDirection,
  comparePriorities,
  compareNumbers,
  compareStrings,
  getNextDirection,
} from '../../utils/tableSorting';

const prioridadClases: Record<string, string> = {
  Alta: 'border-(--tone-red-border-200) bg-(--tone-red-bg-50) text-(--tone-red-text-700)',
  Media: 'border-(--tone-amber-border-200) bg-(--tone-amber-bg-50) text-(--tone-amber-text-700)',
  Baja: 'border-(--border-color) bg-(--surface-subtle) text-(--text-secondary)',
};

export default function ConfiguracionCategorias() {
  const [catalogo, setCatalogo] = useState<Awaited<ReturnType<typeof obtenerCatalogoConfiguracion>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [intento, setIntento] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [seleccionada, setSeleccionada] = useState<CategoriaConfiguracion | null>(null);

  const [sortField, setSortField] = useState<string>('nombre');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: string) => {
    const defaultDir: SortDirection = field === 'prioridad' || field === 'ticketsVinculados' ? 'desc' : 'asc';
    setSortDirection((prevDir) => getNextDirection(sortField, field, prevDir, defaultDir));
    setSortField(field);
  };

  const sortedCategorias = useMemo(() => {
    if (!catalogo) return [];
    return [...catalogo.categorias].sort((a, b) => {
      switch (sortField) {
        case 'nombre':
          return compareStrings(a.nombre, b.nombre, sortDirection);
        case 'especialidad':
          return compareStrings(a.especialidad?.nombre, b.especialidad?.nombre, sortDirection);
        case 'prioridad':
          return comparePriorities(a.prioridadDefecto?.nivel, b.prioridadDefecto?.nivel, sortDirection);
        case 'ticketsVinculados':
          return compareNumbers(a.ticketsVinculados, b.ticketsVinculados, sortDirection);
        default:
          return 0;
      }
    });
  }, [catalogo, sortField, sortDirection]);

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

  if (loading) return <TableSkeleton rows={4} showFilters={false} />;
  if (error) return (
    <div role="alert" className="space-y-3 rounded-xl border border-(--tone-red-border-200) bg-(--tone-red-bg-50) p-4 text-sm text-(--tone-red-text-700)">
      <p>{error}</p>
      <Button variant="neutral" appearance="text" size="custom" type="button" onClick={() => { setError(''); setLoading(true); setIntento((value) => value + 1); }} className="cursor-pointer font-semibold underline">Reintentar</Button>
    </div>
  );
  if (!catalogo) return null;

  const canEdit = catalogo.especialidades.length > 0 && catalogo.prioridades.length > 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-(--text-primary)">Catálogo de Categorías de Incidencias</h3>
          <p className="mt-1 text-sm text-(--text-secondary)">{catalogo.categorias.length} categoría{catalogo.categorias.length !== 1 ? 's' : ''} configurada{catalogo.categorias.length !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="create" appearance="solid" size="custom" type="button" disabled={!canEdit} onClick={() => { setSeleccionada(null); setMensaje(''); setFormOpen(true); }} className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50">
          <Plus className="h-5 w-5" aria-hidden="true" />Nueva categoría
        </Button>
      </div>
      <p role="status" className="text-sm text-(--tone-emerald-text-700)">{mensaje}</p>
      {!canEdit && <p className="text-sm text-(--tone-amber-text-700)">Se necesitan especialidades y prioridades registradas para crear o editar categorías.</p>}
      {catalogo.categorias.length === 0 ? <p className="py-8 text-center text-sm text-(--text-secondary)">Aún no hay categorías registradas.</p> : (
        <div role="region" aria-label="Tabla de categorías con desplazamiento" tabIndex={0} className="max-h-[min(55dvh,28rem)] overflow-auto overscroll-contain rounded-xl border border-(--border-color) [scrollbar-gutter-stable] focus-visible:outline-2 focus-visible:outline-blue-600">
          <table className="w-full min-w-175 text-left text-sm">
            <caption className="sr-only">Categorías con su especialidad, prioridad base y total de incidencias vinculadas</caption>
            <thead className="sticky top-0 z-10 bg-(--surface-muted) text-xs uppercase tracking-wide text-(--text-secondary)">
              <tr>
                <SortableHeader label="Nombre" field="nombre" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-5 py-4" activeColorClass="text-(--tone-blue-text-600)" />
                <SortableHeader label="Especialidad" field="especialidad" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-5 py-4" activeColorClass="text-(--tone-blue-text-600)" />
                <SortableHeader label="Prioridad base" field="prioridad" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-5 py-4" activeColorClass="text-(--tone-blue-text-600)" />
                <SortableHeader label="Tickets vinculados" field="ticketsVinculados" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-5 py-4" align="center" activeColorClass="text-(--tone-blue-text-600)" />
                <th scope="col" className="px-5 py-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-color)">
              {sortedCategorias.map((categoria) => (
                <tr key={categoria.id} className="hover:bg-(--surface-subtle) transition-colors">
                  <th scope="row" className="px-5 py-5 font-semibold text-(--text-primary)"><span className="flex items-center gap-3"><Tag className="h-4 w-4 shrink-0 text-(--tone-blue-text-600)" aria-hidden="true" />{categoria.nombre}</span></th>
                  <td className="px-5 py-5 text-(--text-secondary)">{categoria.especialidad?.nombre ?? 'Sin especialidad'}</td>
                  <td className="px-5 py-5"><span className={`inline-flex whitespace-nowrap rounded border px-2 py-1 text-xs font-semibold ${prioridadClases[categoria.prioridadDefecto?.nivel ?? ''] ?? prioridadClases.Baja}`}>{categoria.prioridadDefecto?.nivel ?? 'Sin definir'}</span></td>
                  <td className="px-5 py-5 text-center font-semibold text-(--text-primary)">{categoria.ticketsVinculados}</td>
                  <td className="px-5 py-5 text-center"><Button variant="info" appearance="soft" size="custom" type="button" disabled={!canEdit} onClick={() => { setSeleccionada(categoria); setMensaje(''); setFormOpen(true); }} aria-label={`Editar categoría ${categoria.nombre}`} className="cursor-pointer rounded-lg p-2 disabled:cursor-not-allowed disabled:opacity-50"><Pencil className="h-5 w-5" aria-hidden="true" /></Button></td>
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
