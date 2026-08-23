import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/dashboard/Header';
import IncidentsTable from '../components/dashboard/IncidentsTable';
import { recentIncidents } from '../data/mockIncidents';

interface IncidenciasPageProps {
  title: string;
  description: string;
}

export default function IncidenciasPage({ title }: IncidenciasPageProps) {
  
  const usuarioGuardado = sessionStorage.getItem('usuario');

  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  const currentUserRole = usuario?.rol;

  console.log(currentUserRole)

  return (
    <>
      <Header title={title}/>
      <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-left">
            <h3 className="text-2xl font-bold text-black">Gestión de Incidencias</h3>
            <p className="text-sm text-slate-500 mt-1">
              {recentIncidents.length} incidencias en el sistema
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
        <div className="xl:col-span-2">
            <IncidentsTable
              incidents={recentIncidents}
              role = {currentUserRole}
              onView = {(_incident) => {}}
              onAssign = {(_incident) => {}}
            />
          </div>
      </main>
    </>
  );
}
