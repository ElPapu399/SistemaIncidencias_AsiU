import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Building2, ChevronRight, MapPin, Plus, Search } from 'lucide-react';
import Header from '../components/dashboard/Header';
import EquipoForm from '../components/dashboard/EquipoForm';
import EquiposTable from '../components/dashboard/EquiposTable';
import { cambiarEstadoEquipo, guardarEquipo, obtenerEquiposLaboratorio, obtenerLaboratorio } from '../services/laboratoriosService';
import { ESTADOS_EQUIPO } from '../types/equipo';
import type { Equipo, EquipoEstadoFormulario, EquipoFormulario } from '../types/equipo';
import type { Laboratorio } from '../types/laboratorio';
import { getCurrentUser } from '../utils/auth';

export default function LaboratorioDetallePage() {
  const { laboratorioId = '' } = useParams();
  const [laboratorio, setLaboratorio] = useState<Laboratorio | null>(null);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
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
    Promise.all([obtenerLaboratorio(laboratorioId), obtenerEquiposLaboratorio(laboratorioId)])
      .then(([lab, data]) => { if (!ignore) { setLaboratorio(lab); setEquipos(data); } })
      .catch((err: unknown) => { if (!ignore) setError(err instanceof Error ? err.message : 'No se pudo cargar el inventario.'); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [laboratorioId, intento]);

  const tipos = [...new Set(equipos.map((equipo) => equipo.tipo))].sort((a, b) => a.localeCompare(b, 'es'));
  const estados = [...new Set([...ESTADOS_EQUIPO, ...equipos.map((equipo) => equipo.estado)])];
  const pcs = equipos.filter((equipo) => ['pc', 'computadora'].includes(equipo.tipo.toLowerCase())).length;
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
    setMensaje('Estado actualizado. El cambio quedó registrado.');
  }

  const inputClass = 'rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-2 focus:outline-blue-600';

  return (
    <>
      <Header title="Equipos del laboratorio" subtitle={laboratorio?.nombre} />
      <main className="flex-1 space-y-6 bg-slate-100 p-6 text-left lg:p-8">
        <nav aria-label="Ruta de navegación" className="flex flex-wrap items-center gap-2 text-sm font-semibold"><Link to="/dashboard/laboratorios" className="inline-flex items-center gap-2 text-blue-600 hover:underline"><Building2 className="h-5 w-5" />Laboratorios</Link><ChevronRight className="h-4 w-4 text-slate-500" aria-hidden="true" /><span aria-current="page" className="text-slate-900">{laboratorio?.nombre ?? 'Detalle del laboratorio'}</span></nav>
        {loading ? <p role="status" className="text-slate-500">Cargando laboratorio y equipos…</p> : error ? (
          <div role="alert" className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"><p>{error}</p><button type="button" onClick={() => { setError(''); setLoading(true); setIntento((value) => value + 1); }} className="cursor-pointer underline">Reintentar</button></div>
        ) : laboratorio && <>
          <section aria-label="Resumen del laboratorio" className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4"><div className="rounded-2xl bg-blue-50 p-4 text-blue-600"><Building2 className="h-7 w-7" /></div><div><h1 className="m-0! text-xl! font-bold! tracking-normal! text-slate-900">{laboratorio.nombre}</h1><p className="mt-1 flex items-center gap-2 text-sm text-slate-500"><MapPin className="h-4 w-4 shrink-0" />{laboratorio.pabellon} · {laboratorio.piso}</p></div></div>
              <span className={`rounded border px-2 py-1 text-xs font-semibold ${laboratorio.estado === 'Operativo' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : laboratorio.estado === 'Mantenimiento' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>{laboratorio.estado}</span>
            </div>
            <dl className="mt-6 grid grid-cols-1 gap-5 border-t border-slate-200 pt-5 text-center sm:grid-cols-3">{[{ label: 'Capacidad', value: laboratorio.capacidad ?? 'Sin registrar' }, { label: 'Computadoras', value: pcs }, { label: 'Encargado', value: laboratorio.encargado }].map((item) => <div key={item.label}><dd className="text-xl font-bold text-slate-900">{item.value}</dd><dt className="mt-1 text-sm text-slate-500">{item.label}</dt></div>)}</dl>
          </section>
          <p role="status" className="text-sm text-emerald-700">{mensaje}</p>
          <section aria-label="Equipos del laboratorio" className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="shrink-0"><h3 className="text-lg font-bold text-slate-900">Equipos</h3><p className="text-sm text-slate-500">{equipos.length} registrados</p></div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="relative min-w-0 flex-1"><span className="sr-only">Buscar equipo</span><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" aria-hidden="true" /><input type="search" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Buscar equipo…" className={`${inputClass} w-full min-w-40 pl-9`} /></label>
                <select aria-label="Filtrar por tipo" value={tipo} onChange={(event) => setTipo(event.target.value)} className={inputClass}><option value="">Todos los tipos</option>{tipo && !tipos.includes(tipo) && <option value={tipo}>{tipo}</option>}{tipos.map((item) => <option key={item} value={item}>{item === 'PC' ? 'Computadora' : item}</option>)}</select>
                <select aria-label="Filtrar por estado" value={estado} onChange={(event) => setEstado(event.target.value)} className={inputClass}><option value="">Todos los estados</option>{estados.map((item) => <option key={item} value={item}>{item}</option>)}</select>
                {(busqueda || tipo || estado) && <button type="button" onClick={() => { setBusqueda(''); setTipo(''); setEstado(''); }} className="cursor-pointer text-xs text-blue-600 underline">Limpiar</button>}
                {puedeEditar && <button type="button" onClick={() => { setMensaje(''); setModal({ modo: 'activo', equipo: null }); }} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"><Plus className="h-5 w-5" />Agregar equipo</button>}
              </div>
            </div>
            <EquiposTable equipos={filtrados} total={equipos.length} puedeEditar={puedeEditar} onEdit={(equipo) => { setMensaje(''); setModal({ modo: 'activo', equipo }); }} onChangeState={(equipo) => { setMensaje(''); setModal({ modo: 'estado', equipo }); }} />
          </section>
        </>}
      </main>
      {modal && <EquipoForm equipo={modal.equipo} modo={modal.modo} laboratorioId={Number(laboratorioId)} onSave={guardar} onChangeState={cambiarEstado} onClose={() => setModal(null)} />}
    </>
  );
}
