import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import Header from '../components/dashboard/Header';
import IncidentsTable from '../components/dashboard/IncidentsTable';
import { obtenerIncidencias } from '../services/incidenciasService';
import type { Incident } from '../types/incident';

interface IncidenciasPageProps {
  title: string;
  description: string;
}

export default function IncidenciasPage({ title }: IncidenciasPageProps) {

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const usuarioGuardado = sessionStorage.getItem('usuario');

  const usuario = usuarioGuardado
    ? JSON.parse(usuarioGuardado)
    : null;

  const currentUserRole = usuario?.rol;

  console.log('Rol actual:', currentUserRole);

  useEffect(() => {
    const cargarIncidencias = async () => {
      try {
        setLoading(true);

        const datos = await obtenerIncidencias();

        setIncidents(datos);
      } catch (error) {
        console.error('Error al cargar incidencias:', error);
        setError('No se pudieron cargar las incidencias.');
      } finally {
        setLoading(false);
      }
    };

    cargarIncidencias();
  }, []);

  return (
    <>
      <Header title={title} />

      <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-200">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div className="text-left">
            <h3 className="text-2xl font-bold text-black">
              Gestión de Incidencias
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              {loading
                ? 'Cargando incidencias...'
                : `${incidents.length} incidencias en el sistema`}
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

        {loading && (
          <div className="bg-white rounded-2xl p-6 text-center text-slate-500">
            Cargando incidencias...
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 rounded-2xl p-6">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="xl:col-span-2">

            <IncidentsTable
              incidents={incidents}
              role={currentUserRole}
              onView={(_incident) => {}}
              onAssign={(_incident) => {}}
            />

          </div>
        )}

      </main>
    </>
  );
}
