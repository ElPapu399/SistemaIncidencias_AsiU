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
import GuidedTour from '../components/dashboard/GuidedTour';
import { getTourSteps, getTourStorageKey } from '../data/tourSteps';
import RoleWelcomeBanner from '../components/dashboard/RoleWelcomeBanner';
import { StatCardsGridSkeleton, TableSkeleton, CategoryBreakdownSkeleton } from '../components/dashboard/SkeletonLoaders';

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

      <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-100">
        <RoleWelcomeBanner nombre={usuario?.nombre} rol={usuario?.rol} />

        {loading ? (
          <>
            <StatCardsGridSkeleton count={isEstudiante ? 4 : 5} />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className={isEstudiante ? 'xl:col-span-3' : 'xl:col-span-2'}>
                <TableSkeleton rows={4} showFilters={false} />
              </div>
              {!isEstudiante && (
                <div>
                  <CategoryBreakdownSkeleton />
                </div>
              )}
            </div>
          </>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
        ) : (
          <>
            <div
              data-tour="stat-cards"
              role="region"
              aria-label="Resumen de incidencias"
              tabIndex={0}
              className={`
                flex w-full min-w-0 gap-3
                overflow-x-auto overscroll-x-contain
                snap-x snap-mandatory pb-2
                sm:grid sm:grid-cols-2 sm:gap-4
                sm:overflow-visible sm:snap-none sm:pb-0
                ${isEstudiante ? 'xl:grid-cols-4' : 'xl:grid-cols-5'} gap-3 sm:gap-4
              `}
            >
              {statCards.map((card) => (
                <div
                  key={card.title}
                  className="w-[55%] min-w-0 shrink-0 snap-start sm:w-auto [&>div]:h-full"
                >
                  <StatCard {...card}/>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div data-tour="recent-incidents" className={isEstudiante ? 'xl:col-span-3' : 'xl:col-span-2'}>
                <RecentIncidentsTable incidents={incidencias} />
              </div>
              {!isEstudiante && <div data-tour="category-breakdown"><CategoryBreakdown items={categoryBreakdown} total={categoryTotal} /></div>}
            </div>
          </>
        )}
      </main>

      {usuario?.rol && (
        <GuidedTour
          steps={getTourSteps(usuario.rol)}
          storageKey={getTourStorageKey(usuario.rol)}
        />
      )}
    </>
  );
}
