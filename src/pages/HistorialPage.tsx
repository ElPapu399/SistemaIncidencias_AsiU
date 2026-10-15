import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/dashboard/Header';
import HistorialTable from '../components/dashboard/HistorialTable';
import IncidentDetailModal from '../components/dashboard/IncidentDetailModal';
import { obtenerIncidencias, obtenerIncidenciasPorEstudiante, obtenerIncidenciasPorTecnico } from '../services/incidenciasService';
import type { Incident } from '../types/incident';
import { getCurrentUser } from '../utils/auth';

// "Resuelto" es el valor heredado de "Resuelta". Las canceladas no forman parte del historial.
const HISTORIAL_STATUSES = new Set(['Resuelta', 'Resuelto', 'Cerrada']);

interface HistorialPageProps {
  title?: string;
  description?: string;
}

export default function HistorialPage({ title = 'Historial', description }: HistorialPageProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [intento, setIntento] = useState(0);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const usuario = getCurrentUser();
  const usuarioId = usuario?.id;
  const rol = usuario?.rol;
  const esEstudiante = rol === 'ESTUDIANTE';
  const esEspecialista = rol === 'TECNICO_ESPECIALISTA' || rol === 'TECNICO';

  useEffect(() => {
    let ignore = false;
    async function cargarHistorial() {
      try {
        if (!usuarioId) throw new Error('No se pudo identificar la sesión actual.');
        const datos = esEstudiante
          ? await obtenerIncidenciasPorEstudiante(usuarioId)
          : esEspecialista
            ? await obtenerIncidenciasPorTecnico(usuarioId)
            : await obtenerIncidencias();
        if (!ignore) setIncidents(datos.filter((incident) => HISTORIAL_STATUSES.has(incident.status)));
      } catch {
        if (!ignore) setError('No se pudo cargar el historial de incidencias. Inténtalo nuevamente.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    cargarHistorial();
    return () => { ignore = true; };
  }, [usuarioId, esEstudiante, esEspecialista, intento]);

  const subtitle = esEstudiante
    ? 'Consulta tus incidencias reportadas que ya fueron resueltas o cerradas.'
    : esEspecialista
      ? 'Consulta tus incidencias asignadas que ya fueron resueltas o cerradas.'
      : description ?? 'Consulta las incidencias resueltas o cerradas del campus.';

  return (
    <>
      <Header title={title} subtitle={subtitle} />
      <main className="flex-1 space-y-6 overflow-y-auto bg-slate-200 p-6">
        <div className="text-left">
          <h3 className="text-2xl font-bold text-black">{esEstudiante || esEspecialista ? 'Mi historial de incidencias' : 'Historial general de incidencias'}</h3>
          <p className="mt-1 text-sm text-slate-600">{loading ? 'Cargando historial…' : error ? 'Historial no disponible' : `${incidents.length} incidencia${incidents.length !== 1 ? 's' : ''} resuelta${incidents.length !== 1 ? 's' : ''} o cerrada${incidents.length !== 1 ? 's' : ''}`}</p>
        </div>
        {loading ? (
          <div role="status" className="rounded-2xl border border-slate-300 bg-white p-12 text-center text-slate-500">
            <FontAwesomeIcon icon={faSpinner} spin className="mb-2 text-2xl text-slate-400" />
            <p>Cargando historial…</p>
          </div>
        ) : error ? (
          <div role="alert" className="space-y-3 rounded-2xl border border-red-300 bg-red-100 p-6 text-sm text-red-700">
            <p>{error}</p>
            <button type="button" onClick={() => { setError(''); setLoading(true); setIntento((actual) => actual + 1); }} className="cursor-pointer font-semibold underline">Reintentar</button>
          </div>
        ) : <HistorialTable incidents={incidents} onView={setSelectedIncident} />}
      </main>
      <IncidentDetailModal
        isOpen={selectedIncident !== null}
        incident={selectedIncident}
        currentUserRole={rol}
        currentUserId={usuarioId}
        onClose={() => setSelectedIncident(null)}
      />
    </>
  );
}
