import { useEffect, useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';

import Header from '../components/dashboard/Header';
import IncidentsTable from '../components/dashboard/IncidentsTable';
import IncidentFormModal from '../components/dashboard/IncidentForm';
import AssignTechnicianModal from '../components/dashboard/AssignTechnicianModal';
import ChangeStatusModal from '../components/dashboard/ChangeStatusModal';

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

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const usuarioGuardado = sessionStorage.getItem('usuario');
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  const currentUserRole = usuario?.rol;

  const cargarIncidencias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const datos = await obtenerIncidencias();
      setIncidents(datos);
    } catch (err) {
      console.error('Error al cargar incidencias:', err);
      setError('No se pudieron cargar las incidencias del servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarIncidencias();
  }, [cargarIncidencias]);

  const handleOpenCreate = () => {
    setIsFormOpen(true);
  };

  const handleView = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsStatusOpen(true);
  };

  const handleAssign = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsAssignOpen(true);
  };

  const handleChangeStatus = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsStatusOpen(true);
  };

  return (
    <>
      <Header title={title} />

      <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-left">
            <h3 className="text-2xl font-bold text-black">
              Gestión de Incidencias
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              {loading
                ? 'Cargando incidencias...'
                : `${incidents.length} incidencia${incidents.length !== 1 ? 's' : ''} registrada${incidents.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-slate-950 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/10 cursor-pointer"
          >
            <FontAwesomeIcon icon={faPlus} />
            Nueva incidencia
          </button>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-300">
            <FontAwesomeIcon icon={faSpinner} spin className="text-2xl mb-2 text-slate-400" />
            <p>Cargando incidencias...</p>
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
              onView={handleView}
              onAssign={handleAssign}
              onChangeStatus={handleChangeStatus}
            />
          </div>
        )}
      </main>

      {/* Modal Nueva Incidencia */}
      <IncidentFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={cargarIncidencias}
      />

      {/* Modal Asignar Técnico (Admin) */}
      <AssignTechnicianModal
        isOpen={isAssignOpen}
        incident={selectedIncident}
        onClose={() => {
          setIsAssignOpen(false);
          setSelectedIncident(null);
        }}
        onAssigned={cargarIncidencias}
      />

      {/* Modal Ver Detalle / Cambiar Estado */}
      <ChangeStatusModal
        isOpen={isStatusOpen}
        incident={selectedIncident}
        currentUserRole={currentUserRole}
        onClose={() => {
          setIsStatusOpen(false);
          setSelectedIncident(null);
        }}
        onUpdated={cargarIncidencias}
      />
    </>
  );
}
