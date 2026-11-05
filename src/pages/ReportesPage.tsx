import { useEffect, useMemo, useState, useCallback } from 'react';
import { BarChart3, CheckCircle2, CircleAlert, Clock3, ShieldCheck, Star, TriangleAlert } from 'lucide-react';
import Header from '../components/dashboard/Header';
import ReportDistributionCard from '../components/dashboard/ReportDistributionCard';
import ReportMetricCard from '../components/dashboard/ReportMetricCard';
import ReportMonthlyChart from '../components/dashboard/ReportMonthlyChart';
import ReportStatusChart from '../components/dashboard/ReportStatusChart';
import ReportTechnicianChart from '../components/dashboard/ReportTechnicianChart';
import AuditLogTable from '../components/dashboard/AuditLogTable';
import { obtenerIncidencias, obtenerTecnicosPorEspecialidad } from '../services/incidenciasService';
import { obtenerEstadosSistema } from '../services/configuracionService';
import { obtenerLogsAuditoria, type AuditoriaLog } from '../services/auditoriaService';
import type { Incident, Tecnico } from '../types/incident';
import { calcularMetricasReportes } from '../utils/reportesMetrics';
import { calcularGraficosReportes } from '../utils/reportesCharts';
import { StatCardsGridSkeleton } from '../components/dashboard/SkeletonLoaders';

export default function ReportesPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [estados, setEstados] = useState<string[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [intento, setIntento] = useState(0);

  const [activeTab, setActiveTab] = useState<'metricas' | 'auditoria'>('metricas');
  const [auditLogs, setAuditLogs] = useState<AuditoriaLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [auditError, setAuditError] = useState('');
  const [auditLoaded, setAuditLoaded] = useState(false);

  const cargarAuditoria = useCallback(async () => {
    setLoadingAudit(true);
    setAuditError('');
    try {
      const data = await obtenerLogsAuditoria();
      setAuditLogs(data);
      setAuditLoaded(true);
    } catch {
      setAuditError('No se pudieron cargar los registros de auditoría del servidor.');
    } finally {
      setLoadingAudit(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'auditoria' && !auditLoaded) {
      cargarAuditoria();
    }
  }, [activeTab, auditLoaded, cargarAuditoria]);

  useEffect(() => {
    let ignore = false;
    Promise.all([obtenerIncidencias(), obtenerEstadosSistema(), obtenerTecnicosPorEspecialidad()])
      .then(([incidencias, estadosSistema, tecnicosSistema]) => {
        if (ignore) return;
        setIncidents(incidencias);
        setEstados(estadosSistema);
        setTecnicos(tecnicosSistema);
      })
      .catch(() => { if (!ignore) setError('No se pudieron cargar los reportes del servidor. Inténtalo nuevamente.'); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [intento]);

  const { meses, categorias, distribucionEstados, rendimiento } = useMemo(
    () => calcularGraficosReportes(incidents, estados, tecnicos),
    [incidents, estados, tecnicos],
  );

  const metricas = useMemo(() => calcularMetricasReportes(incidents), [incidents]);
  const decimal = new Intl.NumberFormat('es-PE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <>
      <Header title="Reportes" subtitle="Estadísticas del sistema de incidencias." />
      <main className="flex-1 space-y-6 bg-slate-100 p-6 text-left lg:p-8">
        <div>
          <h1 className="m-0! text-2xl! font-bold! tracking-normal! text-slate-900">
            {activeTab === 'metricas' ? 'Reportes y estadísticas' : 'Bitácora de auditoría global'}
          </h1>
          <p className="mt-1 text-slate-500">
            {activeTab === 'metricas'
              ? 'Análisis y métricas de desempeño del sistema de incidencias'
              : 'Historial cronológico de cambios de estado, asignaciones y taller'}
          </p>
        </div>

        {/* Selector de Pestañas */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-4" aria-label="Secciones de reportes">
            <button
              type="button"
              onClick={() => setActiveTab('metricas')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'metricas'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Métricas y Estadísticas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('auditoria')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'auditoria'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Bitácora de Auditoría</span>
              {auditLoaded && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                  {auditLogs.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {activeTab === 'auditoria' ? (
          <AuditLogTable
            logs={auditLogs}
            loading={loadingAudit}
            error={auditError}
            onRefresh={cargarAuditoria}
          />
        ) : loading ? (
          <>
            <StatCardsGridSkeleton count={5} />
            <div className="grid auto-rows-[minmax(340px,auto)] grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="h-85 rounded-2xl border border-slate-200 bg-white p-6 animate-pulse" />
              <div className="h-85 rounded-2xl border border-slate-200 bg-white p-6 animate-pulse" />
              <div className="h-85 rounded-2xl border border-slate-200 bg-white p-6 animate-pulse" />
              <div className="h-85 rounded-2xl border border-slate-200 bg-white p-6 animate-pulse" />
            </div>
          </>
        ) : error ? (
          <div role="alert" className="space-y-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            <p>{error}</p>
            <button type="button" onClick={() => { setError(''); setLoading(true); setIntento((actual) => actual + 1); }} className="cursor-pointer font-semibold underline">Reintentar</button>
          </div>
        ) : (
          <>
          <div className="flex w-full min-w-0 gap-3
                overflow-x-auto overscroll-x-contain
                snap-x snap-mandatory pb-2
                sm:grid sm:grid-cols-2 sm:gap-4
                sm:overflow-visible sm:snap-none sm:pb-0 xl:grid-cols-5"
          >
            <div className="w-[75%] min-w-0 shrink-0 snap-start sm:w-auto [&>section]:h-full">
              <ReportMetricCard title="Tasa de resolución" value={`${metricas.tasaResolucion}%`} description={`${metricas.resueltas} de ${incidents.length} incidencias resueltas o cerradas`} icon={CheckCircle2} accent="bg-emerald-500" />
            </div>
            <div className="w-[75%] min-w-0 shrink-0 snap-start sm:w-auto [&>section]:h-full">
              <ReportMetricCard title="Tiempo promedio" value={metricas.tiempoPromedioHoras === null ? '—' : `${decimal.format(metricas.tiempoPromedioHoras)} h`} description={metricas.incidenciasConTiempo > 0 ? 'Desde el registro hasta la resolución o cierre' : 'Sin fechas válidas para calcular el promedio'} icon={Clock3} accent="bg-blue-500" />
            </div>
            <div className="w-[75%] min-w-0 shrink-0 snap-start sm:w-auto [&>section]:h-full">
              <ReportMetricCard title="Alta prioridad" value={metricas.altaPrioridad} description="Incidencias activas de prioridad alta" icon={TriangleAlert} accent="bg-red-500" />
            </div>
            <div className="w-[75%] min-w-0 shrink-0 snap-start sm:w-auto [&>section]:h-full">
              <ReportMetricCard title="Sin asignar" value={metricas.sinAsignar} description="Incidencias activas sin técnico asignado" icon={CircleAlert} accent="bg-orange-500" />
            </div>
            <div className="w-[75%] min-w-0 shrink-0 snap-start sm:w-auto [&>section]:h-full">
              <ReportMetricCard title="Satisfacción (CSAT)" value={metricas.satisfaccion === null ? '—' : decimal.format(metricas.satisfaccion)} suffix="/ 5,0" description={metricas.evaluaciones > 0 ? `Basado en ${metricas.evaluaciones} ${metricas.evaluaciones === 1 ? 'evaluación' : 'evaluaciones'} de estudiantes` : 'Sin evaluaciones de estudiantes'} icon={Star} accent="bg-yellow-400" />
            </div>
          </div>
          <div className="grid auto-rows-[minmax(340px,auto)] grid-cols-1 gap-6 xl:grid-cols-2">
            <ReportMonthlyChart meses={meses} />
            <ReportDistributionCard title="Por categoría" items={categorias} total={incidents.length} />
            <ReportStatusChart items={distribucionEstados} total={incidents.length} />
            <ReportTechnicianChart items={rendimiento} />
          </div>
          </>
        )}
      </main>
    </>
  );
}
