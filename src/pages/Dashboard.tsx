import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList,
  faClock,
  faSpinner,
  faCircleCheck,
  faTriangleExclamation,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import Header from '../components/dashboard/Header';
import StatCard from '../components/dashboard/StatCard';
import RecentIncidentsTable from '../components/dashboard/RecentIncidentsTable';
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown';
import { dashboardStats, categoryBreakdown, recentIncidents } from '../data/mockIncidents';

export default function Dashboard() {
  const categoryTotal = categoryBreakdown.reduce((sum, item) => sum + item.count, 0);

  return (
    <>
      <Header
        title="Panel principal"
        subtitle="Resumen de incidencias universitarias — miércoles, 19 ago 2026"
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-left">
            <h3 className="text-2xl font-bold text-black">Bienvenido al ASIU</h3>
            <p className="text-sm text-slate-400 mt-1">
              Sistema de Atención y Seguimiento de Incidencias Universitarias
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-slate-950 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/10 cursor-pointer"
          >
            <FontAwesomeIcon icon={faPlus} />
            Nueva incidencia
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <StatCard
            title="Total"
            value={dashboardStats.total}
            icon={faClipboardList}
            trend="+12 esta semana"
            accent="bg-violet-500/15 text-violet-400"
          />
          <StatCard
            title="Pendientes"
            value={dashboardStats.pending}
            icon={faClock}
            trend="Requieren asignación"
            accent="bg-amber-500/15 text-amber-400"
          />
          <StatCard
            title="En proceso"
            value={dashboardStats.inProgress}
            icon={faSpinner}
            trend="En seguimiento activo"
            accent="bg-blue-500/15 text-blue-400"
          />
          <StatCard
            title="Resueltas"
            value={dashboardStats.resolved}
            icon={faCircleCheck}
            trend="56% del total"
            accent="bg-emerald-500/15 text-emerald-400"
          />
          <StatCard
            title="Urgentes"
            value={dashboardStats.urgent}
            icon={faTriangleExclamation}
            trend="Atención prioritaria"
            accent="bg-rose-500/15 text-rose-400"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <RecentIncidentsTable incidents={recentIncidents} />
          </div>
          <CategoryBreakdown items={categoryBreakdown} total={categoryTotal} />
        </div>
      </main>
    </>
  );
}
