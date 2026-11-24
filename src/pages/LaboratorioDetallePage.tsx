import Button from '../components/Button';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Building2, ChevronRight, History, MapPin, Plus, Search, ArrowRight } from 'lucide-react';
import Header from '../components/dashboard/Header';
import EquipoForm from '../components/dashboard/EquipoForm';
import EquiposTable from '../components/dashboard/EquiposTable';
import { TableSkeleton } from '../components/dashboard/SkeletonLoaders';
import {
  cambiarEstadoEquipo,
  guardarEquipo,
  obtenerEquiposLaboratorio,
  obtenerHistorialEquiposLaboratorio,
  obtenerLaboratorio,
  type HistorialEquipoItem,
} from '../services/laboratoriosService';
import { ESTADOS_EQUIPO } from '../types/equipo';
import type { Equipo, EquipoEstadoFormulario, EquipoFormulario } from '../types/equipo';
import type { Laboratorio } from '../types/laboratorio';
import { getCurrentUser } from '../utils/auth';

export default function LaboratorioDetallePage() {
  const { laboratorioId = '' } = useParams();
  const [laboratorio, setLaboratorio] = useState<Laboratorio | null>(null);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [historial, setHistorial] = useState<HistorialEquipoItem[]>([]);
  const [pestana, setPestana] = useState<'equipos' | 'historial'>('equipos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [intento, setIntento] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [tipo, setTipo] = useState('');
  const [estado, setEstado] = useState('');
  const [modal, setModal] = useState<{ modo: 'activo' | 'estado'; equipo: Equipo | null } | null>(null);
  const rol = getCurrentUser()?.rol;
  const puedeEditar = rol === 'ADMIN' || rol === 'TECNICO_ESPECIALISTA';

  useEffect(() => {
    let ignore = false;
    Promise.all([
      obtenerLaboratorio(laboratorioId),
      obtenerEquiposLaboratorio(laboratorioId),
      obtenerHistorialEquiposLaboratorio(laboratorioId),
    ])
      .then(([lab, data, hist]) => {
        if (!ignore) {
          setLaboratorio(lab);
          setEquipos(data);
          setHistorial(Array.isArray(hist) ? hist : []);
        }
      })
      .catch((err: unknown) => { if (!ignore) setError(err instanceof Error ? err.message : 'No se pudo cargar el inventario.'); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [laboratorioId, intento]);

  const tipos = [...new Set(equipos.map((equipo) => equipo.tipo))].sort((a, b) => a.localeCompare(b, 'es'));
  const estados = [...new Set([...ESTADOS_EQUIPO, ...equipos.map((equipo) => equipo.estado)])];
  const pcs = equipos.filter((equipo) => ['pc', 'computadora'].includes(equipo.tipo.toLowerCase())).length;
  const operativos = equipos.filter((equipo) => equipo.estado === 'Operativo').length;
  const porcentajeOperativos = equipos.length > 0 ? Math.round((operativos / equipos.length) * 100) : 100;
  const filtrados = useMemo(() => {
    const term = busqueda.trim().toLocaleLowerCase('es');
    return equipos.filter((equipo) => (!tipo || equipo.tipo === tipo) && (!estado || equipo.estado === estado)
      && [equipo.codigo, equipo.marca, equipo.modelo, equipo.numeroSerie, equipo.tipo === 'PC' ? 'Computadora' : equipo.tipo]
        .some((value) => (value ?? '').toLocaleLowerCase('es').includes(term)));
  }, [equipos, busqueda, tipo, estado]);

  async function guardar(datos: EquipoFormulario, id?: number) {
    const equipo = await guardarEquipo(datos, id);
    setEquipos((actuales) => id === undefined ? [...actuales, equipo] : actuales.map((item) => item.id === id ? equipo : item));
    setMensaje(id === undefined ? 'Equipo registrado correctamente.' : 'Activo actualizado correctamente.');
  }

  async function cambiarEstado(id: number, datos: EquipoEstadoFormulario) {
    const equipo = await cambiarEstadoEquipo(id, datos);
    setEquipos((actuales) => actuales.map((item) => item.id === id ? equipo : item));
    obtenerHistorialEquiposLaboratorio(laboratorioId)
      .then((h) => setHistorial(Array.isArray(h) ? h : []))
      .catch(() => {});
    setMensaje('Estado actualizado. El cambio quedó registrado.');
  }

  const inputClass = 'rounded-xl border border-(--border-color) bg-(--surface-subtle) px-3 py-2 text-sm text-(--text-primary) focus:outline-2 focus:outline-blue-600';

  return (
    <>
      <Header title="Equipos del laboratorio" subtitle={laboratorio?.nombre} />
      <main className="flex-1 space-y-6 bg-(--app-bg) p-6 text-left lg:p-8">
        <nav aria-label="Ruta de navegación" className="flex flex-wrap items-center gap-2 text-sm font-semibold"><Link to="/dashboard/laboratorios" className="inline-flex items-center gap-2 text-(--tone-blue-text-600) hover:underline"><Building2 className="h-5 w-5" />Laboratorios</Link><ChevronRight className="h-4 w-4 text-(--text-secondary)" aria-hidden="true" /><span aria-current="page" className="text-(--text-primary)">{laboratorio?.nombre ?? 'Detalle del laboratorio'}</span></nav>
        {loading ? (
          <div className="space-y-6">
            <div className="h-40 rounded-2xl border border-(--border-color) bg-(--surface) p-6 animate-pulse" />
            <TableSkeleton rows={4} showFilters={true} />
          </div>
        ) : error ? (
          <div role="alert" className="space-y-3 rounded-xl border border-(--tone-red-border-200) bg-(--tone-red-bg-50) p-5 text-sm text-(--tone-red-text-700)"><p>{error}</p><Button variant="neutral" appearance="text" size="custom" type="button" onClick={() => { setError(''); setLoading(true); setIntento((value) => value + 1); }} className="cursor-pointer underline">Reintentar</Button></div>
        ) : laboratorio && <>
          <section aria-label="Resumen del laboratorio" className="rounded-2xl border border-(--border-color) bg-(--surface) p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4"><div className="rounded-2xl bg-(--tone-blue-bg-50) p-4 text-(--tone-blue-text-600)"><Building2 className="h-7 w-7" /></div><div><h1 className="m-0! text-xl! font-bold! tracking-normal! text-(--text-primary)">{laboratorio.nombre}</h1><p className="mt-1 flex items-center gap-2 text-sm text-(--text-secondary)"><MapPin className="h-4 w-4 shrink-0" />{laboratorio.pabellon} · {laboratorio.piso}</p></div></div>
              <span className={`rounded border px-2 py-1 text-xs font-semibold ${laboratorio.estado === 'Operativo' ? 'border-(--tone-emerald-border-200) bg-(--tone-emerald-bg-50) text-(--tone-emerald-text-700)' : laboratorio.estado === 'Mantenimiento' ? 'border-(--tone-amber-border-200) bg-(--tone-amber-bg-50) text-(--tone-amber-text-700)' : 'border-(--border-color) bg-(--surface-subtle) text-(--text-secondary)'}`}>{laboratorio.estado}</span>
            </div>
            <dl className="mt-6 grid grid-cols-1 gap-5 border-t border-(--border-color) pt-5 text-center sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Capacidad', value: laboratorio.capacidad ?? 'Sin registrar' },
                { label: 'Computadoras', value: pcs },
                { label: 'Equipos Operativos', value: `${operativos} de ${equipos.length} (${porcentajeOperativos}%)` },
                { label: 'Encargado', value: laboratorio.encargado },
              ].map((item) => (
                <div key={item.label}>
                  <dd className="text-xl font-bold text-(--text-primary)">{item.value}</dd>
                  <dt className="mt-1 text-sm text-(--text-secondary)">{item.label}</dt>
                </div>
              ))}
            </dl>
          </section>
          <p role="status" className="text-sm text-(--tone-emerald-text-700)">{mensaje}</p>

          {/* Navegación por pestañas */}
          <div className="flex border-b border-(--border-color) gap-6 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setPestana('equipos')}
              className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                pestana === 'equipos'
                  ? 'border-blue-600 text-(--tone-blue-text-600)'
                  : 'border-transparent text-(--text-secondary) hover:text-(--text-primary)'
              }`}
            >
              <span>Inventario de Equipos</span>
              <span className="rounded-full bg-(--surface-muted) px-2 py-0.5 text-xs text-(--text-secondary)">
                {equipos.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPestana('historial')}
              className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                pestana === 'historial'
                  ? 'border-blue-600 text-(--tone-blue-text-600)'
                  : 'border-transparent text-(--text-secondary) hover:text-(--text-primary)'
              }`}
            >
              <History className="h-4 w-4" />
              <span>Trazabilidad y Atenciones</span>
              <span className="rounded-full bg-(--surface-muted) px-2 py-0.5 text-xs text-(--text-secondary)">
                {historial.length}
              </span>
            </button>
          </div>

          {pestana === 'equipos' ? (
            <section aria-label="Equipos del laboratorio" className="overflow-hidden rounded-2xl border border-(--border-color) bg-(--surface)">
              <div className="flex flex-col gap-4 border-b border-(--border-color) p-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="shrink-0"><h3 className="text-lg font-bold text-(--text-primary)">Equipos</h3><p className="text-sm text-(--text-secondary)">{equipos.length} registrados</p></div>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="relative min-w-0 flex-1"><span className="sr-only">Buscar equipo</span><Search className="absolute left-3 top-2.5 h-4 w-4 text-(--text-secondary)" aria-hidden="true" /><input type="search" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Buscar equipo…" className={`${inputClass} w-full min-w-40 pl-9`} /></label>
                  <select aria-label="Filtrar por tipo" value={tipo} onChange={(event) => setTipo(event.target.value)} className={inputClass}><option value="">Todos los tipos</option>{tipo && !tipos.includes(tipo) && <option value={tipo}>{tipo}</option>}{tipos.map((item) => <option key={item} value={item}>{item === 'PC' ? 'Computadora' : item}</option>)}</select>
                  <select aria-label="Filtrar por estado" value={estado} onChange={(event) => setEstado(event.target.value)} className={inputClass}><option value="">Todos los estados</option>{estados.map((item) => <option key={item} value={item}>{item}</option>)}</select>
                  {(busqueda || tipo || estado) && <Button variant="neutral" appearance="text" size="custom" type="button" onClick={() => { setBusqueda(''); setTipo(''); setEstado(''); }} className="cursor-pointer text-xs underline">Limpiar</Button>}
                  {puedeEditar && <Button variant="create" appearance="solid" size="custom" type="button" onClick={() => { setMensaje(''); setModal({ modo: 'activo', equipo: null }); }} className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"><Plus className="h-5 w-5" />Agregar equipo</Button>}
                </div>
              </div>
              <EquiposTable equipos={filtrados} total={equipos.length} puedeEditar={puedeEditar} onEdit={(equipo) => { setMensaje(''); setModal({ modo: 'activo', equipo }); }} onChangeState={(equipo) => { setMensaje(''); setModal({ modo: 'estado', equipo }); }} />
            </section>
          ) : (
            <section aria-label="Historial de atenciones" className="overflow-hidden rounded-2xl border border-(--border-color) bg-(--surface)">
              <div className="border-b border-(--border-color) p-5">
                <h3 className="text-lg font-bold text-(--text-primary)">Historial de Cambios y Atenciones</h3>
                <p className="text-sm text-(--text-secondary)">Registro cronológico de mantenimiento, reparaciones y bajas vinculado a incidencias técnicas.</p>
              </div>

              {historial.length === 0 ? (
                <div className="py-12 px-6 text-center text-(--text-secondary)">
                  <History className="mx-auto h-8 w-8 text-(--text-secondary) mb-2 opacity-50" />
                  <p className="font-semibold text-sm">Sin registros de cambios aún</p>
                  <p className="text-xs text-(--text-secondary) mt-1">Cuando los técnicos atiendan incidencias o modifiquen el estado de los equipos, quedará registrado aquí.</p>
                </div>
              ) : (
                <div className="max-h-[min(60dvh,32rem)] overflow-auto overscroll-contain">
                  <table className="w-full min-w-180 text-left text-sm">
                    <thead className="sticky top-0 z-10 bg-(--surface-muted) text-xs uppercase tracking-wide text-(--text-secondary)">
                      <tr>
                        {['Fecha y Hora', 'Equipo', 'Transición de Estado', 'Responsable', 'Motivo / Ticket'].map((label) => (
                          <th key={label} scope="col" className="px-5 py-4 font-semibold">{label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-(--border-color)">
                      {historial.map((item) => {
                        const fecha = item.fecha ? new Date(item.fecha) : null;
                        return (
                          <tr key={item.id} className="transition-colors even:bg-(--surface-subtle) hover:bg-(--tone-blue-bg-50)/50">
                            <td className="whitespace-nowrap px-5 py-4 text-xs text-(--text-secondary)">
                              {fecha && Number.isFinite(fecha.getTime())
                                ? fecha.toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                : 'Sin fecha'}
                            </td>
                            <td className="px-5 py-4">
                              <span className="font-mono text-xs font-bold text-(--text-primary)">{item.equipoCodigo}</span>
                              <span className="text-xs text-(--text-secondary) ml-1.5">({item.equipoTipo})</span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="inline-flex items-center gap-1.5 text-xs">
                                <span className="rounded border px-2 py-0.5 border-(--border-color) bg-(--surface-muted) text-(--text-secondary)">
                                  {item.estadoAnterior}
                                </span>
                                <ArrowRight className="h-3 w-3 text-(--text-secondary)" />
                                <span className={`rounded border px-2 py-0.5 font-semibold ${
                                  item.estadoNuevo === 'Operativo'
                                    ? 'border-(--tone-emerald-border-200) bg-(--tone-emerald-bg-50) text-(--tone-emerald-text-700)'
                                    : item.estadoNuevo === 'En reparación'
                                    ? 'border-(--tone-amber-border-200) bg-(--tone-amber-bg-50) text-(--tone-amber-text-700)'
                                    : item.estadoNuevo === 'Mantenimiento'
                                    ? 'border-(--tone-blue-border-200) bg-(--tone-blue-bg-50) text-(--tone-blue-text-700)'
                                    : 'border-(--border-color) bg-(--surface-muted) text-(--text-secondary)'
                                }`}>
                                  {item.estadoNuevo}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-xs font-medium text-(--text-primary)">
                              {item.usuarioNombre || 'Sistema'}
                            </td>
                            <td className="px-5 py-4 text-xs text-(--text-primary) max-w-xs break-words">
                              {item.motivo || 'Actualización de estado'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </>}
      </main>
      {modal && <EquipoForm equipo={modal.equipo} modo={modal.modo} laboratorioId={Number(laboratorioId)} onSave={guardar} onChangeState={cambiarEstado} onClose={() => setModal(null)} />}
    </>
  );
}
