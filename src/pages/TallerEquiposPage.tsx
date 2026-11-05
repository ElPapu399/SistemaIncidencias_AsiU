import { useState, useEffect, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWrench,
  faMagnifyingGlass,
  faCheckCircle,
  faTriangleExclamation,
  faComputer,
  faXmark,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';

import Header from '../components/dashboard/Header';
import Button from '../components/Button';
import { TableSkeleton } from '../components/dashboard/SkeletonLoaders';
import {
  obtenerTodosLosEquipos,
  cambiarEstadoEquipo,
} from '../services/laboratoriosService';
import { obtenerIncidencias } from '../services/incidenciasService';
import type { Equipo, EstadoEquipo } from '../types/equipo';
import type { Incident } from '../types/incident';

const ESTADOS_DISPONIBLES: EstadoEquipo[] = [
  'Operativo',
  'En reparación',
  'Mantenimiento',
  'Dado de baja',
];

const BADGE_ESTADOS: Record<string, { bg: string; text: string; border: string }> = {
  Operativo: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'En reparación': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  Mantenimiento: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Dado de baja': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

export default function TallerEquiposPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [incidencias, setIncidencias] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'afectados' | 'todos' | EstadoEquipo>('afectados');

  // Modal para cambiar estado
  const [modalAbierto, setModalAbierto] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<Equipo | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoEquipo>('Operativo');
  const [motivo, setMotivo] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [equiposData, incidenciasData] = await Promise.all([
        obtenerTodosLosEquipos(),
        obtenerIncidencias().catch(() => [] as Incident[]),
      ]);
      setEquipos(equiposData);
      setIncidencias(incidenciasData);
    } catch {
      setError('No se pudo cargar el listado de equipos. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Mapa de incidencias activas asociadas a equipos
  const incidenciasPorEquipo = useMemo(() => {
    const mapa = new Map<string, Incident>();
    incidencias.forEach((inc) => {
      if (inc.equipoCodigo && !['Resuelta', 'Resuelto', 'Cerrada'].includes(inc.status)) {
        if (!mapa.has(inc.equipoCodigo)) {
          mapa.set(inc.equipoCodigo, inc);
        }
      }
    });
    return mapa;
  }, [incidencias]);

  // Contadores
  const metricas = useMemo(() => {
    const total = equipos.length;
    const operativos = equipos.filter((e) => e.estado === 'Operativo').length;
    const enReparacion = equipos.filter((e) => e.estado === 'En reparación').length;
    const mantenimiento = equipos.filter((e) => e.estado === 'Mantenimiento').length;
    const dadosDeBaja = equipos.filter((e) => e.estado === 'Dado de baja').length;
    const afectados = enReparacion + mantenimiento + dadosDeBaja;
    return { total, operativos, enReparacion, mantenimiento, dadosDeBaja, afectados };
  }, [equipos]);

  // Filtrado de equipos
  const equiposFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();

    return equipos.filter((e) => {
      // Filtro de estado
      if (filtroEstado === 'afectados') {
        if (e.estado === 'Operativo') return false;
      } else if (filtroEstado !== 'todos') {
        if (e.estado !== filtroEstado) return false;
      }

      // Filtro de búsqueda
      if (!q) return true;
      return (
        e.codigo.toLowerCase().includes(q) ||
        (e.ubicacionTexto && e.ubicacionTexto.toLowerCase().includes(q)) ||
        (e.tipo && e.tipo.toLowerCase().includes(q)) ||
        (e.marca && e.marca.toLowerCase().includes(q)) ||
        (e.modelo && e.modelo.toLowerCase().includes(q)) ||
        (e.numeroSerie && e.numeroSerie.toLowerCase().includes(q))
      );
    });
  }, [equipos, busqueda, filtroEstado]);

  const abrirModalCambio = (equipo: Equipo, estadoSugerido?: EstadoEquipo) => {
    setEquipoSeleccionado(equipo);
    setNuevoEstado(estadoSugerido || (equipo.estado === 'Operativo' ? 'Mantenimiento' : 'Operativo'));
    setMotivo(
      estadoSugerido === 'Operativo'
        ? 'Equipo reparado e instalado en su ubicación'
        : ''
    );
    setError('');
    setModalAbierto(true);
  };

  const handleGuardarEstado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipoSeleccionado) return;
    if (!motivo.trim()) {
      setError('Debes indicar un motivo o diagnóstico para el cambio de estado.');
      return;
    }

    setGuardando(true);
    setError('');
    try {
      await cambiarEstadoEquipo(equipoSeleccionado.id, {
        estado: nuevoEstado,
        motivo: motivo.trim(),
      });
      setModalAbierto(false);
      setMensajeExito(`Estado de ${equipoSeleccionado.codigo} actualizado a «${nuevoEstado}».`);
      setTimeout(() => setMensajeExito(''), 4000);
      cargarDatos();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cambiar estado';
      setError(msg);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <Header
        title="Taller y Diagnóstico de Equipos"
        subtitle="Supervisión de hardware del campus que requiere mantenimiento o reparación técnica."
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-100 text-left">
        {/* Banner de Métricas Rápidas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Equipos Afectados
            </span>
            <div className="text-2xl font-bold text-amber-600 mt-1">
              {metricas.afectados}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Requieren atención técnica
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              En Reparación
            </span>
            <div className="text-2xl font-bold text-orange-600 mt-1">
              {metricas.enReparacion}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Intervención en curso
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              En Mantenimiento
            </span>
            <div className="text-2xl font-bold text-amber-500 mt-1">
              {metricas.mantenimiento}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Preventivo o revisión
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Operativos
            </span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {metricas.operativos}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Disponibles en el campus
            </p>
          </div>
        </div>

        {/* Notificación de éxito */}
        {mensajeExito && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2">
            <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-600" />
            <span>{mensajeExito}</span>
          </div>
        )}

        {/* Barra de Filtros */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm" />
              </div>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por código (ej. PC-01), laboratorio, marca o tipo..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setFiltroEstado('afectados')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors border ${
                  filtroEstado === 'afectados'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Solo Afectados ({metricas.afectados})
              </button>

              <button
                type="button"
                onClick={() => setFiltroEstado('todos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors border ${
                  filtroEstado === 'todos'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Todos ({metricas.total})
              </button>

              <button
                type="button"
                onClick={() => setFiltroEstado('Operativo')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors border ${
                  filtroEstado === 'Operativo'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Operativos ({metricas.operativos})
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de Equipos */}
        {loading ? (
          <TableSkeleton rows={6} showFilters={true} />
        ) : equiposFiltrados.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <FontAwesomeIcon icon={faComputer} className="text-2xl text-slate-400" />
            </div>
            <h4 className="text-base font-bold text-slate-800">
              No hay equipos para mostrar
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              {filtroEstado === 'afectados'
                ? '¡Excelente! No hay equipos averiados ni en mantenimiento actualmente.'
                : 'No se encontraron equipos que coincidan con los filtros seleccionados.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Equipo</th>
                    <th className="px-5 py-3.5">Ubicación</th>
                    <th className="px-5 py-3.5">Estado</th>
                    <th className="px-5 py-3.5">Incidencia Abierta</th>
                    <th className="px-5 py-3.5 text-center">Acciones de Campo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {equiposFiltrados.map((equipo) => {
                    const badge = BADGE_ESTADOS[equipo.estado] || {
                      bg: 'bg-slate-50',
                      text: 'text-slate-600',
                      border: 'border-slate-200',
                    };
                    const incAsociada = incidenciasPorEquipo.get(equipo.codigo);
                    const estaAfectado = equipo.estado !== 'Operativo';

                    return (
                      <tr key={equipo.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5 font-medium">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                              <FontAwesomeIcon icon={faComputer} className="text-xs" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{equipo.codigo}</div>
                              <div className="text-[11px] text-slate-400">
                                {equipo.tipo} {equipo.marca ? `• ${equipo.marca}` : ''}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="font-medium text-slate-800">
                            {equipo.ubicacionTexto || 'Sin ubicación'}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
                          >
                            {equipo.estado}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          {incAsociada ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                <FontAwesomeIcon icon={faTriangleExclamation} className="text-[10px]" />
                                {incAsociada.id}
                              </span>
                              <p className="text-[11px] text-slate-500 truncate max-w-xs">
                                {incAsociada.title}
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs italic">
                              Sin ticket activo
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {estaAfectado && (
                              <button
                                type="button"
                                onClick={() => abrirModalCambio(equipo, 'Operativo')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors cursor-pointer"
                                title="Marcar como reparado y operativo"
                              >
                                <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                                <span>Operativo</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => abrirModalCambio(equipo)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors cursor-pointer"
                              title="Cambiar estado y registrar diagnóstico"
                            >
                              <FontAwesomeIcon icon={faWrench} className="text-xs text-slate-500" />
                              <span>Actualizar</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
              Mostrando {equiposFiltrados.length} de {equipos.length} equipos registrados
            </div>
          </div>
        )}

        {/* Modal de Cambio de Estado */}
        {modalAbierto && equipoSeleccionado && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <FontAwesomeIcon icon={faWrench} className="text-sm" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Actualizar Estado Técnico
                    </h3>
                    <p className="text-xs text-slate-400">
                      {equipoSeleccionado.codigo} • {equipoSeleccionado.ubicacionTexto}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm p-1 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleGuardarEstado} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nuevo Estado del Equipo
                  </label>
                  <select
                    value={nuevoEstado}
                    onChange={(e) => setNuevoEstado(e.target.value as EstadoEquipo)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                  >
                    {ESTADOS_DISPONIBLES.map((est) => (
                      <option key={est} value={est}>
                        {est}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Motivo / Diagnóstico de Campo *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Describe la reparación realizada, cambio de piezas o motivo del mantenimiento..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white resize-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Este diagnóstico quedará registrado en el historial técnico del equipo con tu usuario.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalAbierto(false)}
                    disabled={guardando}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={guardando}
                    text={guardando ? 'Guardando...' : 'Guardar Cambio'}
                  />
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
