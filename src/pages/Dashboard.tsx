import { useEffect, useState } from 'react';
import {
  faClipboardList,
  faClock,
  faSpinner,
  faCircleCheck,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';

import Header from '../components/dashboard/Header';
import StatCard from '../components/dashboard/StatCard';
import RecentIncidentsTable from '../components/dashboard/RecentIncidentsTable';
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown';

import { obtenerIncidencias } from '../services/incidenciasService';
import type { Incident } from '../types/incident';

const categoryColorPalette = [
  '#8b5cf6', // Violet
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#ec4899', // Pink
];

export default function Dashboard() {
  const [incidencias, setIncidencias] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    obtenerIncidencias()
      .then((data) => {
        setIncidencias(data);
      })
      .catch((err) => {
        console.error(err);
        setError('No se pudieron cargar las incidencias');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const total = incidencias.length;

  const pendientes = incidencias.filter(
    (incidencia) => incidencia.status === 'Pendiente'
  ).length;

  const enProceso = incidencias.filter(
    (incidencia) => incidencia.status === 'En Proceso'
  ).length;

  const resueltas = incidencias.filter(
    (incidencia) => incidencia.status === 'Resuelto'
  ).length;

  const altas = incidencias.filter(
    (incidencia) => incidencia.priority === 'Alta'
  ).length;

  const categoryCounts = incidencias.reduce<Record<string, number>>(
    (acc, incidencia) => {
      const cat = incidencia.category || 'Otros';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    },
    {}
  );

  const categoryBreakdown = Object.entries(categoryCounts).map(
    ([category, count], idx) => ({
      label: category,
      count,
      color: categoryColorPalette[idx % categoryColorPalette.length],
    })
  );

  const categoryTotal = categoryBreakdown.reduce(
    (sum, item) => sum + item.count,
    0
  );

  if (loading) {
    return (
      <>
        <Header
          title="Panel principal"
          subtitle="Resumen de incidencias universitarias"
        />

        <main className="flex-1 overflow-y-auto p-6 bg-slate-200">
          <p className="text-slate-600">Cargando incidencias...</p>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header
          title="Panel principal"
          subtitle="Resumen de incidencias universitarias"
        />

        <main className="flex-1 overflow-y-auto p-6 bg-slate-200">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header
        title="Panel principal"
        subtitle="Resumen de incidencias universitarias"
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-left">
            <h3 className="text-2xl font-bold text-black">
              Bienvenido al ASIU
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Sistema de Atención y Seguimiento de Incidencias Universitarias
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <StatCard
            title="Total"
            value={total}
            icon={faClipboardList}
            trend="Incidencias registradas"
            accent="bg-violet-500/15 text-violet-400"
          />

          <StatCard
            title="Pendientes"
            value={pendientes}
            icon={faClock}
            trend="Requieren asignación"
            accent="bg-amber-500/15 text-amber-400"
          />

          <StatCard
            title="En proceso"
            value={enProceso}
            icon={faSpinner}
            trend="En seguimiento activo"
            accent="bg-blue-500/15 text-blue-400"
          />

          <StatCard
            title="Resueltas"
            value={resueltas}
            icon={faCircleCheck}
            trend={`${total > 0 ? Math.round((resueltas / total) * 100) : 0}% del total`}
            accent="bg-emerald-500/15 text-emerald-400"
          />

          <StatCard
            title="Alta prioridad"
            value={altas}
            icon={faTriangleExclamation}
            trend="Atención prioritaria"
            accent="bg-rose-500/15 text-rose-400"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <RecentIncidentsTable incidents={incidencias} />
          </div>

          <CategoryBreakdown
            items={categoryBreakdown}
            total={categoryTotal}
          />
        </div>
      </main>
    </>
  );
}
