import { useEffect, useState, useMemo } from 'react';
import {
  faClipboardList, faClock, faSpinner, faCircleCheck, faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';

import Header from '../components/dashboard/Header';
import StatCard from '../components/dashboard/StatCard';
import RecentIncidentsTable from '../components/dashboard/RecentIncidentsTable';
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown';

import { obtenerIncidencias } from '../services/incidenciasService';
import type { Incident } from '../types/incident';
import { getCurrentUser } from '../utils/auth';

const CATEGORY_COLORS = ['#8b5cf6', '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#ec4899'];

export default function Dashboard() {
  const [incidencias, setIncidencias] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const usuario = getCurrentUser();
  const isEstudiante = usuario?.rol === 'ESTUDIANTE';

  useEffect(() => {
    obtenerIncidencias()
      .then(setIncidencias)
      .catch(() => setError('No se pudieron cargar las incidencias'))
      .finally(() => setLoading(false));
  }, []);

  const { total, pendientes, enProceso, resueltas, altas, categoryBreakdown, categoryTotal } = useMemo(() => {
    const base = isEstudiante ? incidencias.filter((i) => i.reporterId === usuario?.id) : incidencias;

    let pending = 0, inProgress = 0, resolved = 0, highPriority = 0;
    const categoryCounts: Record<string, number> = {};

    for (const inc of base) {
      if (inc.status === 'Pendiente') pending++;
      else if (['En Proceso', 'En atención', 'Asignada'].includes(inc.status)) inProgress++;
      else if (inc.status === 'Resuelto' || inc.status === 'Resuelta') resolved++;
      if (inc.priority === 'Alta') highPriority++;
      const cat = inc.category || 'Otros';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }

    const breakdown = Object.entries(categoryCounts).map(([label, count], idx) => ({
      label, count, color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
    }));

    return {
      total: base.length, pendientes: pending, enProceso: inProgress, resueltas: resolved, altas: highPriority,
      categoryBreakdown: breakdown, categoryTotal: breakdown.reduce((sum, item) => sum + item.count, 0),
    };
  }, [incidencias, isEstudiante, usuario?.id]);

  const statCards = [
    { title: 'Total', value: total, icon: faClipboardList, trend: 'Incidencias registradas', accent: 'bg-violet-500/15 text-violet-400' },
    { title: 'Pendientes', value: pendientes, icon: faClock, trend: 'Requieren asignación', accent: 'bg-amber-500/15 text-amber-400' },
    { title: 'En atención', value: enProceso, icon: faSpinner, trend: 'En seguimiento activo', accent: 'bg-blue-500/15 text-blue-400' },
    { title: 'Resueltas', value: resueltas, icon: faCircleCheck, trend: `${total > 0 ? Math.round((resueltas / total) * 100) : 0}% del total`, accent: 'bg-emerald-500/15 text-emerald-400' },
    ...(!isEstudiante ? [{ title: 'Alta prioridad', value: altas, icon: faTriangleExclamation, trend: 'Atención prioritaria', accent: 'bg-rose-500/15 text-rose-400' }] : []),
  ];

  return (
    <>
      <Header title="Panel principal" subtitle="Resumen de incidencias universitarias" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-200">
        {loading ? (
          <p className="text-slate-600">Cargando incidencias...</p>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-left">
                <h3 className="text-2xl font-bold text-black">Bienvenido al ASIU</h3>
                <p className="text-sm text-slate-500 mt-1">Sistema de Atención y Seguimiento de Incidencias Universitarias</p>
              </div>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 ${isEstudiante ? 'xl:grid-cols-4' : 'xl:grid-cols-5'} gap-4`}>
              {statCards.map((card) => <StatCard key={card.title} {...card} />)}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className={isEstudiante ? 'xl:col-span-3' : 'xl:col-span-2'}>
                <RecentIncidentsTable incidents={incidencias} />
              </div>
              {!isEstudiante && <CategoryBreakdown items={categoryBreakdown} total={categoryTotal} />}
            </div>
          </>
        )}
      </main>
    </>
  );
}
