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
  Operativo: { bg: 'bg-(--tone-emerald-bg-50)', text: 'text-(--tone-emerald-text-700)', border: 'border-(--tone-emerald-border-200)' },
  'En reparación': { bg: 'bg-(--tone-orange-bg-50)', text: 'text-(--tone-orange-text-700)', border: 'border-(--tone-orange-border-200)' },
  Mantenimiento: { bg: 'bg-(--tone-amber-bg-50)', text: 'text-(--tone-amber-text-700)', border: 'border-(--tone-amber-border-200)' },
  'Dado de baja': { bg: 'bg-(--tone-rose-bg-50)', text: 'text-(--tone-rose-text-700)', border: 'border-(--tone-rose-border-200)' },
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

      <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-(--app-bg) text-left">
        {/* Banner de Métricas Rápidas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-(--surface) rounded-2xl p-4 border border-(--border-color) shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-(--text-secondary)">
              Equipos Afectados
            </span>
            <div className="text-2xl font-bold text-(--tone-amber-text-600) mt-1">
              {metricas.afectados}
            </div>
            <p className="text-[11px] text-(--text-secondary) mt-0.5">
              Requieren atención técnica
            </p>
          </div>

          <div className="bg-(--surface) rounded-2xl p-4 border border-(--border-color) shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-(--text-secondary)">
              En Reparación
            </span>
            <div className="text-2xl font-bold text-(--tone-orange-text-600) mt-1">
              {metricas.enReparacion}
            </div>
            <p className="text-[11px] text-(--text-secondary) mt-0.5">
              Intervención en curso
            </p>
          </div>

          <div className="bg-(--surface) rounded-2xl p-4 border border-(--border-color) shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-(--text-secondary)">
              En Mantenimiento
            </span>
            <div className="text-2xl font-bold text-(--tone-amber-text-600) mt-1">
              {metricas.mantenimiento}
            </div>
            <p className="text-[11px] text-(--text-secondary) mt-0.5">
              Preventivo o revisión
            </p>
          </div>

          <div className="bg-(--surface) rounded-2xl p-4 border border-(--border-color) shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-(--text-secondary)">
              Operativos
            </span>
            <div className="text-2xl font-bold text-(--tone-emerald-text-600) mt-1">
              {metricas.operativos}
            </div>
            <p className="text-[11px] text-(--text-secondary) mt-0.5">
              Disponibles en el campus
            </p>
          </div>
        </div>

        {/* Notificación de éxito */}
        {mensajeExito && (
          <div className="p-3.5 bg-(--tone-emerald-bg-50) border border-(--tone-emerald-border-200) text-(--tone-emerald-text-800) rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2">
            <FontAwesomeIcon icon={faCircleCheck} className="text-(--tone-emerald-text-600)" />
            <span>{mensajeExito}</span>
          </div>
        )}

        {/* Barra de Filtros */}
        <div className="bg-(--surface) rounded-2xl p-4 border border-(--border-color) shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-(--text-secondary)">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm" />
              </div>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por código (ej. PC-01), laboratorio, marca o tipo..."
                className="w-full pl-10 pr-4 py-2 bg-(--surface-subtle) border border-(--border-color) rounded-xl text-xs sm:text-sm text-(--text-primary) placeholder:text-(--text-secondary) focus:outline-none focus:border-blue-600 focus:bg-(--surface) transition-colors"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setFiltroEstado('afectados')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors border ${
                  filtroEstado === 'afectados'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-(--surface-subtle) text-(--text-secondary) border-(--border-color) hover:bg-(--surface-muted)'
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
                    : 'bg-(--surface-subtle) text-(--text-secondary) border-(--border-color) hover:bg-(--surface-muted)'
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
                    : 'bg-(--surface-subtle) text-(--text-secondary) border-(--border-color) hover:bg-(--surface-muted)'
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
          <div className="text-center py-16 bg-(--surface) rounded-2xl border border-(--border-color) p-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-(--surface-muted) flex items-center justify-center mb-3">
              <FontAwesomeIcon icon={faComputer} className="text-2xl text-(--text-secondary)" />
            </div>
            <h4 className="text-base font-bold text-(--text-primary)">
              No hay equipos para mostrar
            </h4>
            <p className="text-xs text-(--text-secondary) mt-1">
              {filtroEstado === 'afectados'
                ? '¡Excelente! No hay equipos averiados ni en mantenimiento actualmente.'
                : 'No se encontraron equipos que coincidan con los filtros seleccionados.'}
            </p>
          </div>
        ) : (
          <div className="bg-(--surface) rounded-2xl border border-(--border-color) overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-(--surface-subtle) text-(--text-secondary) font-semibold border-b border-(--border-color) text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Equipo</th>
                    <th className="px-5 py-3.5">Ubicación</th>
                    <th className="px-5 py-3.5">Estado</th>
                    <th className="px-5 py-3.5">Incidencia Abierta</th>
                    <th className="px-5 py-3.5 text-center">Acciones de Campo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border-color) text-(--text-primary)">
                  {equiposFiltrados.map((equipo) => {
                    const badge = BADGE_ESTADOS[equipo.estado] || {
                      bg: 'bg-(--surface-subtle)',
                      text: 'text-(--text-secondary)',
                      border: 'border-(--border-color)',
                    };
                    const incAsociada = incidenciasPorEquipo.get(equipo.codigo);
                    const estaAfectado = equipo.estado !== 'Operativo';

                    return (
                      <tr key={equipo.id} className="hover:bg-(--surface-subtle)/60 transition-colors">
                        <td className="px-5 py-3.5 font-medium">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-(--tone-blue-bg-50) text-(--tone-blue-text-600) flex items-center justify-center shrink-0">
                              <FontAwesomeIcon icon={faComputer} className="text-xs" />
                            </div>
                            <div>
                              <div className="font-bold text-(--text-primary)">{equipo.codigo}</div>
                              <div className="text-[11px] text-(--text-secondary)">
                                {equipo.tipo} {equipo.marca ? `• ${equipo.marca}` : ''}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="font-medium text-(--text-primary)">
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
                              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-(--tone-amber-text-700) bg-(--tone-amber-bg-50) px-2 py-0.5 rounded border border-(--tone-amber-border-200)">
                                <FontAwesomeIcon icon={faTriangleExclamation} className="text-[10px]" />
                                {incAsociada.id}
                              </span>
                              <p className="text-[11px] text-(--text-secondary) truncate max-w-xs">
                                {incAsociada.title}
                              </p>
                            </div>
                          ) : (
                            <span className="text-(--text-secondary) text-xs italic">
                              Sin ticket activo
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {estaAfectado && (
                              <Button variant="success" appearance="soft" size="custom"
                                type="button"
                                onClick={() => abrirModalCambio(equipo, 'Operativo')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer"
                                title="Marcar como reparado y operativo"
                              >
                                <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                                <span>Operativo</span>
                              </Button>
                            )}
                            <Button variant="success" appearance="soft" size="custom"
                              type="button"
                              onClick={() => abrirModalCambio(equipo)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer"
                              title="Cambiar estado y registrar diagnóstico"
                            >
                              <FontAwesomeIcon icon={faWrench} className="text-xs " />
                              <span>Actualizar</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 bg-(--surface-subtle) border-t border-(--border-color) text-xs text-(--text-secondary)">
              Mostrando {equiposFiltrados.length} de {equipos.length} equipos registrados
            </div>
          </div>
        )}

        {/* Modal de Cambio de Estado */}
        {modalAbierto && equipoSeleccionado && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-(--surface) rounded-2xl max-w-md w-full p-6 shadow-2xl border border-(--border-color) space-y-4">
              <div className="flex items-center justify-between border-b border-(--border-color) pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-(--tone-blue-bg-100) text-(--tone-blue-text-700) flex items-center justify-center">
                    <FontAwesomeIcon icon={faWrench} className="text-sm" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-(--text-primary)">
                      Actualizar Estado Técnico
                    </h3>
                    <p className="text-xs text-(--text-secondary)">
                      {equipoSeleccionado.codigo} • {equipoSeleccionado.ubicacionTexto}
                    </p>
                  </div>
                </div>
                <Button variant="cancel" appearance="soft" size="custom"
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="text-sm p-1 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </Button>
              </div>

              {error && (
                <div className="p-3 bg-(--tone-rose-bg-50) border border-(--tone-rose-border-200) text-(--tone-rose-text-700) rounded-xl text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleGuardarEstado} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-(--text-primary) uppercase tracking-wider mb-1.5">
                    Nuevo Estado del Equipo
                  </label>
                  <select
                    value={nuevoEstado}
                    onChange={(e) => setNuevoEstado(e.target.value as EstadoEquipo)}
                    className="w-full px-3 py-2 bg-(--surface-subtle) border border-(--border-color) rounded-xl text-sm text-(--text-primary) focus:outline-none focus:border-blue-600 focus:bg-(--surface)"
                  >
                    {ESTADOS_DISPONIBLES.map((est) => (
                      <option key={est} value={est}>
                        {est}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-(--text-primary) uppercase tracking-wider mb-1.5">
                    Motivo / Diagnóstico de Campo *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Describe la reparación realizada, cambio de piezas o motivo del mantenimiento..."
                    className="w-full px-3 py-2 bg-(--surface-subtle) border border-(--border-color) rounded-xl text-sm text-(--text-primary) focus:outline-none focus:border-blue-600 focus:bg-(--surface) resize-none"
                  />
                  <p className="text-[11px] text-(--text-secondary) mt-1">
                    Este diagnóstico quedará registrado en el historial técnico del equipo con tu usuario.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-(--border-color)">
                  <Button variant="cancel" appearance="soft" size="custom"
                    type="button"
                    onClick={() => setModalAbierto(false)}
                    disabled={guardando}
                    className="px-4 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant={nuevoEstado === 'Dado de baja' ? 'danger' : 'success'} size="md" fullWidth
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
