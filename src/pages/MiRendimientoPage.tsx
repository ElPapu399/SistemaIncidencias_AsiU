import { useState, useEffect, useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faClock,
  faStar,
  faBolt,
  faTicket,
  faWrench,
  faChartPie,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';

import Header from '../components/dashboard/Header';
import {
  StatCardsGridSkeleton,
  TableSkeleton,
} from '../components/dashboard/SkeletonLoaders';
import { obtenerIncidenciasPorTecnico } from '../services/incidenciasService';
import { getCurrentUser } from '../utils/auth';
import type { Incident } from '../types/incident';
import { formatDate } from '../components/dashboard/IncidentBadges';

const CLOSED_STATUSES = ['Resuelta', 'Resuelto', 'Cerrada', 'Cancelado'];

function calcularTiempoResolucion(inc: Incident): string {
  const finStr = inc.closedAt || inc.updatedAt;
  const inicioStr = inc.startedAt || inc.createdAt;
  if (!finStr || !inicioStr) return '—';
  try {
    const diffMs = new Date(finStr).getTime() - new Date(inicioStr).getTime();
    if (diffMs <= 0 || isNaN(diffMs)) return '—';
    const minutos = Math.round(diffMs / (1000 * 60));
    if (minutos < 60) return `${minutos} min`;
    const horas = (diffMs / (1000 * 60 * 60)).toFixed(1);
    return `${horas} h`;
  } catch {
    return '—';
  }
}

export default function MiRendimientoPage() {
  const usuario = getCurrentUser();
  const tecnicoId = usuario?.id;

  const [incidencias, setIncidencias] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarDatos = useCallback(async () => {
    if (!tecnicoId) return;
    setLoading(true);
    setError('');
    try {
      const data = await obtenerIncidenciasPorTecnico(tecnicoId);
      setIncidencias(data);
    } catch {
      setError('No se pudieron cargar tus métricas de rendimiento del servidor.');
    } finally {
      setLoading(false);
    }
  }, [tecnicoId]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Cálculos de métricas
  const resueltas = useMemo(
    () => incidencias.filter((i) => CLOSED_STATUSES.includes(i.status)),
    [incidencias]
  );

  const enAtencion = useMemo(
    () =>
      incidencias.filter((i) =>
        ['En atención', 'En Proceso', 'Asignada'].includes(i.status)
      ),
    [incidencias]
  );

  const calificados = useMemo(
    () => incidencias.filter((i) => typeof i.calificacion === 'number'),
    [incidencias]
  );

  const promedioCalificacion = useMemo(() => {
    if (calificados.length === 0) return null;
    const suma = calificados.reduce((acc, i) => acc + (i.calificacion || 0), 0);
    return (suma / calificados.length).toFixed(1);
  }, [calificados]);

  const tiempoPromedioHoras = useMemo(() => {
    const conTiempo = resueltas.filter((i) => {
      const fin = i.closedAt || i.updatedAt;
      const inicio = i.startedAt || i.createdAt;
      if (!fin || !inicio) return false;
      const diff = new Date(fin).getTime() - new Date(inicio).getTime();
      return diff > 0 && !isNaN(diff);
    });
    if (conTiempo.length === 0) return null;
    const sumaMs = conTiempo.reduce((acc, i) => {
      const fin = i.closedAt || i.updatedAt;
      const inicio = i.startedAt || i.createdAt;
      return acc + (new Date(fin!).getTime() - new Date(inicio!).getTime());
    }, 0);
    return (sumaMs / (conTiempo.length * 1000 * 60 * 60)).toFixed(1);
  }, [resueltas]);

  // Desglose por categoría
  const categoriasAtendidas = useMemo(() => {
    const conteo: Record<string, number> = {};
    incidencias.forEach((i) => {
      const cat = i.category || 'General';
      conteo[cat] = (conteo[cat] || 0) + 1;
    });
    const lista = Object.entries(conteo).map(([nombre, cantidad]) => ({
      nombre,
      cantidad,
      porcentaje: incidencias.length > 0 ? Math.round((cantidad / incidencias.length) * 100) : 0,
    }));
    return lista.sort((a, b) => b.cantidad - a.cantidad);
  }, [incidencias]);

  // Últimas atenciones resueltas (máximo 5)
  const ultimasResueltas = useMemo(() => {
    return [...resueltas]
      .sort((a, b) => {
        const fechaA = new Date(a.closedAt || a.updatedAt || a.createdAt).getTime();
        const fechaB = new Date(b.closedAt || b.updatedAt || b.createdAt).getTime();
        return fechaB - fechaA;
      })
      .slice(0, 5);
  }, [resueltas]);

  const tasaResolucion = useMemo(() => {
    if (incidencias.length === 0) return 0;
    return Math.round((resueltas.length / incidencias.length) * 100);
  }, [incidencias, resueltas]);

  return (
    <>
      <Header
        title="Mi Rendimiento"
        subtitle="Métricas personales de productividad, tiempos de atención y satisfacción."
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-100 text-left">
        {/* Encabezado del Técnico */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              Técnico Especialista
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
              Rendimiento Operativo de {usuario?.nombre} {usuario?.apellido}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Resumen acumulado de incidencias asignadas y resueltas en laboratorios.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Tasa de resolución:
            </span>
            <span className="text-base font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              {tasaResolucion}%
            </span>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs sm:text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={cargarDatos}
              className="font-bold underline cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Tarjetas de Métricas Rápidas */}
        {loading ? (
          <StatCardsGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tickets Resueltos */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Resueltos
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
                    {resueltas.length}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                  <FontAwesomeIcon icon={faCheckCircle} />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-3">
                {resueltas.length} de {incidencias.length} tickets asignados
              </p>
            </div>

            {/* En Atención */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    En Atención
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">
                    {enAtencion.length}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                  <FontAwesomeIcon icon={faClock} />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-3">
                Tickets actualmente en proceso
              </p>
            </div>

            {/* Tiempo Promedio */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Tiempo Promedio
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 mt-1">
                    {tiempoPromedioHoras ? `${tiempoPromedioHoras} h` : '—'}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg">
                  <FontAwesomeIcon icon={faBolt} />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-3">
                Por ticket resuelto
              </p>
            </div>

            {/* Calificación Promedio */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Satisfacción
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-amber-500 mt-1">
                    {promedioCalificacion ? `${promedioCalificacion} ★` : '—'}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-lg">
                  <FontAwesomeIcon icon={faStar} />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-3">
                {calificados.length} {calificados.length === 1 ? 'evaluación' : 'evaluaciones'} de alumnos
              </p>
            </div>
          </div>
        )}

        {/* Sección de Desglose de Categorías y Estados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Desglose de Categorías Atendidas */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faChartPie} className="text-blue-600 text-sm" />
              <h3 className="text-sm font-bold text-slate-900">
                Fallas Atendidas por Categoría
              </h3>
            </div>

            {categoriasAtendidas.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Aún no tienes tickets asignados para clasificar.
              </p>
            ) : (
              <div className="space-y-3">
                {categoriasAtendidas.map((cat) => (
                  <div key={cat.nombre} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{cat.nombre}</span>
                      <span className="font-mono text-slate-500">
                        {cat.cantidad} ({cat.porcentaje}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${cat.porcentaje}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resumen del Flujo de Trabajo */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faWrench} className="text-purple-600 text-sm" />
              <h3 className="text-sm font-bold text-slate-900">
                Distribución de tus Tickets
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-bold text-emerald-900">Resueltas / Cerradas</span>
                </div>
                <span className="font-extrabold text-emerald-700 text-sm">
                  {resueltas.length}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="font-bold text-blue-900">En Atención Activa</span>
                </div>
                <span className="font-extrabold text-blue-700 text-sm">
                  {enAtencion.length}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="font-bold text-amber-900">Total Histórico Asignado</span>
                </div>
                <span className="font-extrabold text-amber-800 text-sm">
                  {incidencias.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Últimas Atenciones Resueltas */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-600 text-sm" />
              <h3 className="text-sm font-bold text-slate-900">
                Últimas Atenciones Cerradas con Éxito
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {ultimasResueltas.length} más recientes
            </span>
          </div>

          {loading ? (
            <TableSkeleton rows={3} showFilters={false} />
          ) : ultimasResueltas.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Aún no tienes tickets cerrados registrados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Ticket</th>
                    <th className="px-5 py-3">Problema y Categoría</th>
                    <th className="px-5 py-3">Ubicación</th>
                    <th className="px-5 py-3">Tiempo</th>
                    <th className="px-5 py-3">Calificación</th>
                    <th className="px-5 py-3">Fecha de Cierre</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {ultimasResueltas.map((inc) => (
                    <tr key={inc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-slate-800 text-xs">
                        <div className="flex items-center gap-1.5">
                          <FontAwesomeIcon icon={faTicket} className="text-slate-400 text-[11px]" />
                          <span>{inc.id}</span>
                        </div>
                      </td>

                      <td className="px-5 py-3">
                        <div className="font-semibold text-slate-900">{inc.title}</div>
                        <div className="text-[11px] text-slate-400">{inc.category}</div>
                      </td>

                      <td className="px-5 py-3 text-xs text-slate-600">
                        {inc.location || 'Campus'}
                      </td>

                      <td className="px-5 py-3 text-xs font-mono font-semibold text-purple-700">
                        {calcularTiempoResolucion(inc)}
                      </td>

                      <td className="px-5 py-3 text-xs whitespace-nowrap">
                        {typeof inc.calificacion === 'number' ? (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <FontAwesomeIcon icon={faStar} className="text-[10px]" />
                            {inc.calificacion}/5
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">
                            Sin calificar
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3 text-xs text-slate-400 font-mono whitespace-nowrap">
                        {formatDate(inc.closedAt || inc.updatedAt || inc.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
