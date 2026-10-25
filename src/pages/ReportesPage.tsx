import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, CircleAlert, Clock3, Star, TriangleAlert } from 'lucide-react';
import Header from '../components/dashboard/Header';
import ReportDistributionCard from '../components/dashboard/ReportDistributionCard';
import ReportMetricCard from '../components/dashboard/ReportMetricCard';
import ReportMonthlyChart from '../components/dashboard/ReportMonthlyChart';
import ReportStatusChart from '../components/dashboard/ReportStatusChart';
import ReportTechnicianChart from '../components/dashboard/ReportTechnicianChart';
import { obtenerIncidencias, obtenerTecnicosPorEspecialidad } from '../services/incidenciasService';
import { obtenerEstadosSistema } from '../services/configuracionService';
import type { Incident, Tecnico } from '../types/incident';
import { calcularMetricasReportes } from '../utils/reportesMetrics';
import { calcularGraficosReportes } from '../utils/reportesCharts';

export default function ReportesPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [estados, setEstados] = useState<string[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [intento, setIntento] = useState(0);

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
      <main className="flex-1 space-y-8 bg-slate-100 p-6 text-left lg:p-8">
        <div>
          <h1 className="m-0! text-2xl! font-bold! tracking-normal! text-slate-900">Reportes y estadísticas</h1>
          <p className="mt-1 text-slate-500">Análisis del sistema de incidencias</p>
        </div>
        {loading ? <p role="status" className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Cargando reportes…</p> : error ? (
          <div role="alert" className="space-y-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            <p>{error}</p>
            <button type="button" onClick={() => { setError(''); setLoading(true); setIntento((actual) => actual + 1); }} className="cursor-pointer font-semibold underline">Reintentar</button>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            <ReportMetricCard title="Tasa de resolución" value={`${metricas.tasaResolucion}%`} description={`${metricas.resueltas} de ${incidents.length} incidencias resueltas o cerradas`} icon={CheckCircle2} accent="bg-emerald-500" />
            <ReportMetricCard title="Tiempo promedio" value={metricas.tiempoPromedioHoras === null ? '—' : `${decimal.format(metricas.tiempoPromedioHoras)} h`} description={metricas.incidenciasConTiempo > 0 ? 'Desde el registro hasta la resolución o cierre' : 'Sin fechas válidas para calcular el promedio'} icon={Clock3} accent="bg-blue-500" />
            <ReportMetricCard title="Alta prioridad" value={metricas.altaPrioridad} description="Incidencias activas de prioridad alta" icon={TriangleAlert} accent="bg-red-500" />
            <ReportMetricCard title="Sin asignar" value={metricas.sinAsignar} description="Incidencias activas sin técnico asignado" icon={CircleAlert} accent="bg-orange-500" />
            <ReportMetricCard title="Satisfacción (CSAT)" value={metricas.satisfaccion === null ? '—' : decimal.format(metricas.satisfaccion)} suffix="/ 5,0" description={metricas.evaluaciones > 0 ? `Basado en ${metricas.evaluaciones} ${metricas.evaluaciones === 1 ? 'evaluación' : 'evaluaciones'} de estudiantes` : 'Sin evaluaciones de estudiantes'} icon={Star} accent="bg-yellow-400" />
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
