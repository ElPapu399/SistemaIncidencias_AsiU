import { useEffect, useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { guardarEspecialidad, obtenerEspecialidades } from '../../services/configuracionService';
import type { EspecialidadCatalogo, EspecialidadFormulario } from '../../services/configuracionService';
import EspecialidadForm from './EspecialidadForm';

export default function ConfiguracionEspecialidades() {
  const [especialidades, setEspecialidades] = useState<EspecialidadCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [intento, setIntento] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [seleccionada, setSeleccionada] = useState<EspecialidadCatalogo | null>(null);

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

  if (loading) return <p role="status" className="text-sm text-slate-500">Cargando especialidades…</p>;
  if (error) return (
    <div role="alert" className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <p>{error}</p>
      <button type="button" onClick={() => { setError(''); setLoading(true); setIntento((value) => value + 1); }} className="cursor-pointer font-semibold underline">Reintentar</button>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Catálogo de Especialidades</h3>
          <p className="mt-1 text-sm text-slate-500">{especialidades.length} especialidad{especialidades.length !== 1 ? 'es' : ''} registrada{especialidades.length !== 1 ? 's' : ''}</p>
        </div>
        <button type="button" onClick={() => { setSeleccionada(null); setMensaje(''); setFormOpen(true); }} className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
          <Plus className="h-5 w-5" aria-hidden="true" />Nueva especialidad
        </button>
      </div>
      <p role="status" className="text-sm text-emerald-700">{mensaje}</p>
      {especialidades.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">Aún no hay especialidades registradas. Crea la primera para poder asignarla a categorías y técnicos.</p> : (
        <div role="region" aria-label="Tabla de especialidades con desplazamiento" tabIndex={0} className="max-h-[min(55dvh,28rem)] overflow-auto overscroll-contain rounded-xl border border-slate-200 [scrollbar-gutter:stable] focus-visible:outline-2 focus-visible:outline-blue-600">
          <table className="w-full min-w-125 text-left text-sm">
            <caption className="sr-only">Especialidades registradas y sus descripciones</caption>
            <thead className="sticky top-0 z-10 bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
              <tr>{['Nombre', 'Descripción', 'Acciones'].map((label) => <th key={label} scope="col" className="px-5 py-4 font-semibold">{label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {especialidades.map((especialidad) => (
                <tr key={especialidad.id}>
                  <th scope="row" className="max-w-60 wrap-anywhere px-5 py-5 font-semibold text-slate-900">{especialidad.nombre}</th>
                  <td className="max-w-lg wrap-anywhere px-5 py-5 text-slate-500">{especialidad.descripcion || 'Sin descripción'}</td>
                  <td className="px-5 py-5"><button type="button" onClick={() => { setSeleccionada(especialidad); setMensaje(''); setFormOpen(true); }} aria-label={`Editar especialidad ${especialidad.nombre}`} className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600"><Pencil className="h-5 w-5" aria-hidden="true" /></button></td>
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
