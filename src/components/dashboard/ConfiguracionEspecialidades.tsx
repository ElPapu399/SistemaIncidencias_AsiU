import Button from '../Button';
import { useEffect, useState, useMemo } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { guardarEspecialidad, obtenerEspecialidades } from '../../services/configuracionService';
import type { EspecialidadCatalogo, EspecialidadFormulario } from '../../services/configuracionService';
import EspecialidadForm from './EspecialidadForm';
import { TableSkeleton } from './SkeletonLoaders';
import SortableHeader from '../common/SortableHeader';
import {
  type SortDirection,
  compareStrings,
  getNextDirection,
} from '../../utils/tableSorting';

export default function ConfiguracionEspecialidades() {
  const [especialidades, setEspecialidades] = useState<EspecialidadCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [intento, setIntento] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [seleccionada, setSeleccionada] = useState<EspecialidadCatalogo | null>(null);

  const [sortField, setSortField] = useState<string>('nombre');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: string) => {
    setSortDirection((prevDir) => getNextDirection(sortField, field, prevDir, 'asc'));
    setSortField(field);
  };

  const sortedEspecialidades = useMemo(() => {
    return [...especialidades].sort((a, b) => {
      switch (sortField) {
        case 'nombre':
          return compareStrings(a.nombre, b.nombre, sortDirection);
        case 'descripcion':
          return compareStrings(a.descripcion, b.descripcion, sortDirection);
        default:
          return 0;
      }
    });
  }, [especialidades, sortField, sortDirection]);

  useEffect(() => {
    let ignore = false;
    obtenerEspecialidades()
      .then((datos) => { if (!ignore) setEspecialidades(datos); })
      .catch((err: unknown) => { if (!ignore) setError(err instanceof Error ? err.message : 'No se pudieron cargar las especialidades.'); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [intento]);

  async function handleSave(datos: EspecialidadFormulario, id?: number) {
    const especialidad = await guardarEspecialidad(datos, id);
    setEspecialidades((actuales) => id === undefined ? [...actuales, especialidad]
      : actuales.map((item) => item.id === id ? especialidad : item));
    setMensaje(id === undefined ? 'Especialidad creada correctamente.' : 'Especialidad actualizada correctamente.');
  }

  if (loading) return <TableSkeleton rows={4} showFilters={false} />;
  if (error) return (
    <div role="alert" className="space-y-3 rounded-xl border border-(--tone-red-border-200) bg-(--tone-red-bg-50) p-4 text-sm text-(--tone-red-text-700)">
      <p>{error}</p>
      <Button variant="neutral" appearance="text" size="custom" type="button" onClick={() => { setError(''); setLoading(true); setIntento((value) => value + 1); }} className="cursor-pointer font-semibold underline">Reintentar</Button>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-(--text-primary)">Catálogo de Especialidades</h3>
          <p className="mt-1 text-sm text-(--text-secondary)">{especialidades.length} especialidad{especialidades.length !== 1 ? 'es' : ''} registrada{especialidades.length !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="create" appearance="solid" size="custom" type="button" onClick={() => { setSeleccionada(null); setMensaje(''); setFormOpen(true); }} className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold">
          <Plus className="h-5 w-5" aria-hidden="true" />Nueva especialidad
        </Button>
      </div>
      <p role="status" className="text-sm text-(--tone-emerald-text-700)">{mensaje}</p>
      {especialidades.length === 0 ? <p className="py-8 text-center text-sm text-(--text-secondary)">Aún no hay especialidades registradas. Crea la primera para poder asignarla a categorías y técnicos.</p> : (
        <div role="region" aria-label="Tabla de especialidades con desplazamiento" tabIndex={0} className="max-h-[min(55dvh,28rem)] overflow-auto overscroll-contain rounded-xl border border-(--border-color) [scrollbar-gutter:stable] focus-visible:outline-2 focus-visible:outline-blue-600">
          <table className="w-full min-w-125 text-left text-sm">
            <caption className="sr-only">Especialidades registradas y sus descripciones</caption>
            <thead className="sticky top-0 z-10 bg-(--surface-muted) text-xs uppercase tracking-wide text-(--text-secondary)">
              <tr>
                <SortableHeader label="Nombre" field="nombre" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-5 py-4" activeColorClass="text-(--tone-blue-text-600)" />
                <SortableHeader label="Descripción" field="descripcion" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-5 py-4" activeColorClass="text-(--tone-blue-text-600)" />
                <th scope="col" className="px-5 py-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-color)">
              {sortedEspecialidades.map((especialidad) => (
                <tr key={especialidad.id} className="hover:bg-(--surface-subtle) transition-colors">
                  <th scope="row" className="max-w-60 wrap-anywhere px-5 py-5 font-semibold text-(--text-primary)">{especialidad.nombre}</th>
                  <td className="max-w-lg wrap-anywhere px-5 py-5 text-(--text-secondary)">{especialidad.descripcion || 'Sin descripción'}</td>
                  <td className="px-5 py-5 text-center"><Button variant="info" appearance="soft" size="custom" type="button" onClick={() => { setSeleccionada(especialidad); setMensaje(''); setFormOpen(true); }} aria-label={`Editar especialidad ${especialidad.nombre}`} className="cursor-pointer rounded-lg p-2"><Pencil className="h-5 w-5" aria-hidden="true" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {formOpen && <EspecialidadForm especialidad={seleccionada} onSave={handleSave} onClose={() => setFormOpen(false)} />}
    </div>
  );
}
