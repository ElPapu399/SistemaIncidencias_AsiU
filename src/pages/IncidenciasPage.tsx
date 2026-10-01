import { useEffect, useState, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faSpinner, faClipboardCheck, faListUl, faHandsHoldingChild, faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { ArrowRightLeft } from 'lucide-react';

import Header from '../components/dashboard/Header';
import IncidentsTable from '../components/dashboard/IncidentsTable';
import IncidentFormModal from '../components/dashboard/IncidentForm';
import AssignTechnicianModal from '../components/dashboard/AssignTechnicianModal';
import ChangeStatusModal from '../components/dashboard/ChangeStatusModal';
import RequestReassignModal from '../components/dashboard/RequestReassignModal';
import ManageReassignmentsModal from '../components/dashboard/ManageReassignmentsModal';
import IncidentDetailModal from '../components/dashboard/IncidentDetailModal';
import IncidentTraceabilityModal from '../components/dashboard/IncidentTraceabilityModal';

import {
  obtenerIncidencias, obtenerIncidenciasPorEstudiante, obtenerIncidenciasPorTecnico,
  obtenerSolicitudesPendientes, asignarTecnico, type SolicitudReasignacion,
} from '../services/incidenciasService';
import type { Incident } from '../types/incident';
import { getCurrentUser } from '../utils/auth';
import Button from '../components/Button';

const CLOSED_STATUSES = ['Resuelta', 'Resuelto', 'Cerrada', 'Cancelado'];

type ModalKey = 'form' | 'detail' | 'traceability' | 'assign' | 'status' | 'reassign' | 'manageReassign' | null;

interface IncidenciasPageProps {
  title?: string;
  description?: string;
  soloMisIncidencias?: boolean;
}

export default function IncidenciasPage({ title, description, soloMisIncidencias = false }: IncidenciasPageProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState<SolicitudReasignacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [tecnicoFilter, setTecnicoFilter] = useState<'all' | 'mine' | 'available'>(
    soloMisIncidencias ? 'mine' : 'all'
  );

  // Un solo estado para controlar qué modal está abierto
  const [activeModal, setActiveModal] = useState<ModalKey>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const usuario = getCurrentUser();
  const currentUserRole = usuario?.rol;
  const isEstudiante = currentUserRole === 'ESTUDIANTE';
  const isSupportOrAdmin = currentUserRole === 'ADMIN' || currentUserRole === 'TECNICO_GENERAL';
  const isTecnicoEspecialista = currentUserRole === 'TECNICO_ESPECIALISTA' || currentUserRole === 'TECNICO';

  const [prevSoloMisIncidencias, setPrevSoloMisIncidencias] = useState(soloMisIncidencias);
  if (soloMisIncidencias !== prevSoloMisIncidencias) {
    setPrevSoloMisIncidencias(soloMisIncidencias);
    setTecnicoFilter(soloMisIncidencias ? 'mine' : 'all');
  }

  const cargarSolicitudes = useCallback(async () => {
    if (['ADMIN', 'TECNICO_GENERAL', 'TECNICO_ESPECIALISTA'].includes(currentUserRole || '')) {
      try {
        setSolicitudesPendientes(await obtenerSolicitudesPendientes());
      } catch (err) {
        console.warn('Error al cargar solicitudes pendientes:', err);
      }
    }
  }, [currentUserRole]);

  const cargarIncidencias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const datos = isEstudiante && usuario?.id
        ? await obtenerIncidenciasPorEstudiante(usuario.id)
        : soloMisIncidencias && usuario?.id && isTecnicoEspecialista
        ? await obtenerIncidenciasPorTecnico(usuario.id)
        : await obtenerIncidencias();
      setIncidents(datos);
    } catch {
      setError('No se pudieron cargar las incidencias del servidor.');
    } finally {
      setLoading(false);
    }
  }, [isEstudiante, soloMisIncidencias, isTecnicoEspecialista, usuario?.id]);

  const recargar = useCallback(() => { cargarIncidencias(); cargarSolicitudes(); }, [cargarIncidencias, cargarSolicitudes]);

  useEffect(() => {
    let ignore = false;
    const cargarTodo = async () => {
      try {
        setError(null);
        const [incidenciasData, solicitudesData] = await Promise.all([
          isEstudiante && usuario?.id
            ? obtenerIncidenciasPorEstudiante(usuario.id)
            : soloMisIncidencias && usuario?.id && isTecnicoEspecialista
            ? obtenerIncidenciasPorTecnico(usuario.id)
            : obtenerIncidencias(),
          ['ADMIN', 'TECNICO_GENERAL', 'TECNICO_ESPECIALISTA'].includes(currentUserRole || '')
            ? obtenerSolicitudesPendientes().catch(() => [])
            : Promise.resolve([]),
        ]);
        if (!ignore) {
          setIncidents(incidenciasData);
          setSolicitudesPendientes(solicitudesData);
        }
      } catch {
        if (!ignore) setError('No se pudieron cargar las incidencias del servidor.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    cargarTodo();
    return () => {
      ignore = true;
    };
  }, [isEstudiante, soloMisIncidencias, isTecnicoEspecialista, usuario?.id, currentUserRole]);

  // Helpers de modal
  const openModal = useCallback((modal: ModalKey, incident?: Incident) => {
    if (incident) setSelectedIncident(incident);
    setActiveModal(modal);
  }, []);

  const closeModal = useCallback(() => { setActiveModal(null); setSelectedIncident(null); }, []);

  const pendingIncidentIds = useMemo(
    () => new Set(solicitudesPendientes.map((s) => s.incidenciaId)),
    [solicitudesPendientes]
  );

  // Helpers de filtrado para tabs de técnico
  const isAssignedToMe = useCallback((i: Incident) =>
    Number(i.assigneeId) === Number(usuario?.id) ||
    (i.assignee && usuario?.nombre && i.assignee.toLowerCase().includes(usuario.nombre.toLowerCase())),
    [usuario]
  );

  const isAvailable = useCallback((i: Incident) =>
    (!i.assigneeId || i.assignee === 'Sin asignar' || i.status === 'Pendiente') &&
    !CLOSED_STATUSES.includes(i.status),
    []
  );

  const myAssignedCount = useMemo(() => isTecnicoEspecialista && usuario ? incidents.filter(isAssignedToMe).length : 0, [incidents, isTecnicoEspecialista, usuario, isAssignedToMe]);
  const availableCount = useMemo(() => isTecnicoEspecialista ? incidents.filter(isAvailable).length : 0, [incidents, isTecnicoEspecialista, isAvailable]);

  const displayedIncidents = useMemo(() => {
    if (soloMisIncidencias || !isTecnicoEspecialista) return incidents;
    if (tecnicoFilter === 'mine') return incidents.filter(isAssignedToMe);
    if (tecnicoFilter === 'available') return incidents.filter(isAvailable);
    return incidents;
  }, [incidents, soloMisIncidencias, isTecnicoEspecialista, tecnicoFilter, isAssignedToMe, isAvailable]);

  const handleSelfAssign = useCallback(async (incident: Incident) => {
    if (!incident.numericId || !usuario?.id) return;
    if (!window.confirm(`¿Deseas autoasignarte la incidencia "${incident.id} - ${incident.title}"?`)) return;
    try {
      await asignarTecnico(incident.numericId, usuario.id);
      setSuccessToast(`¡Te has autoasignado la incidencia ${incident.id} correctamente!`);
      setTimeout(() => setSuccessToast(null), 4000);
      recargar();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al autoasignarse la incidencia');
    }
  }, [usuario?.id, recargar]);

  // Títulos dinámicos
  const pageTitle = isEstudiante ? 'Mis Incidencias'
    : soloMisIncidencias ? 'Mis Incidencias Asignadas'
    : isTecnicoEspecialista ? 'Todas las Incidencias'
    : title || 'Incidencias';

  const pageSubtitle = isEstudiante
    ? 'Consulta, filtra y da seguimiento al estado de tus incidencias reportadas en el campus.'
    : soloMisIncidencias ? 'Consulta y atiende únicamente las incidencias asignadas a tu cuenta como técnico especialista.'
    : isTecnicoEspecialista ? 'Consulta el estado de todas las incidencias del campus o autoasígnate tickets disponibles.'
    : description || 'Gestión de incidencias del campus.';

  const sectionHeading = isEstudiante ? 'Mis Incidencias Reportadas'
    : soloMisIncidencias ? 'Mis Incidencias Asignadas'
    : isTecnicoEspecialista ? 'Todas las Incidencias del Campus'
    : 'Gestión de Incidencias';

  const n = displayedIncidents.length;
  const countLabel = loading ? 'Cargando incidencias...'
    : `${n} incidencia${n !== 1 ? 's' : ''} ${soloMisIncidencias ? 'asignada' : isEstudiante ? 'reportada' : 'registrada'}${n !== 1 ? 's' : ''}`;

  // Config de tabs para técnico especialista
  const tecnicoTabs = [
    { key: 'all' as const, label: 'Todas las incidencias', icon: faListUl, count: incidents.length, activeClass: 'bg-white text-slate-900 shadow-sm', badgeClass: 'bg-slate-100 text-slate-700' },
    { key: 'mine' as const, label: 'Mis asignadas', icon: faClipboardCheck, count: myAssignedCount, activeClass: 'bg-violet-600 text-white shadow-sm', badgeClass: 'bg-violet-500 text-white', inactiveClass: 'bg-violet-100 text-violet-800' },
    { key: 'available' as const, label: 'Disponibles para tomar', icon: faHandsHoldingChild, count: availableCount, activeClass: 'bg-emerald-600 text-white shadow-sm', badgeClass: 'bg-emerald-500 text-white', inactiveClass: 'bg-emerald-100 text-emerald-800' },
  ];

  return (
    <>
      <Header title={pageTitle} subtitle={pageSubtitle} />

      <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-200">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-left">
            <h3 className="text-2xl font-bold text-black">{sectionHeading}</h3>
            <p className="text-sm text-slate-600 mt-1">{countLabel}</p>
          </div>
          <div className="flex items-center gap-3">
            {isSupportOrAdmin && solicitudesPendientes.length > 0 && (
              <button type="button" onClick={() => openModal('manageReassign')} className="inline-flex items-center gap-2 px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer">
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Reasignaciones ({solicitudesPendientes.length})</span>
              </button>
            )}
            {isEstudiante && (
              <Button text="Nueva incidencia" icon={<FontAwesomeIcon icon={faPlus} />} type="button" onClick={() => openModal('form')} variant="secondary" />
            )}
          </div>
        </div>

        {/* Toast */}
        {successToast && (
          <div className="bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center justify-between text-sm font-semibold animate-fade-in">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCheck} className="text-white" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast(null)} className="text-emerald-100 hover:text-white ml-4 text-xs underline cursor-pointer">Cerrar</button>
          </div>
        )}

        {/* Banner reasignaciones */}
        {isSupportOrAdmin && solicitudesPendientes.length > 0 && (
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700 shrink-0">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-slate-900">
                  {solicitudesPendientes.length === 1
                    ? 'Tienes 1 solicitud de reasignación pendiente'
                    : `Tienes ${solicitudesPendientes.length} solicitudes de reasignación pendientes`}
                </h4>
                <p className="text-xs text-slate-600">Técnicos especialistas han solicitado transferir incidencias. Puedes revisarlas y reasignar o rechazar.</p>
              </div>
            </div>
            <button type="button" onClick={() => openModal('manageReassign')} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0">
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Revisar Solicitudes ({solicitudesPendientes.length})</span>
            </button>
          </div>
        )}

        {/* Tabs técnico especialista */}
        {isTecnicoEspecialista && !soloMisIncidencias && (
          <div className="flex items-center gap-2 p-1 bg-slate-300/70 rounded-2xl max-w-fit">
            {tecnicoTabs.map((tab) => {
              const isActive = tecnicoFilter === tab.key;
              return (
                <button key={tab.key} type="button" onClick={() => setTecnicoFilter(tab.key)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${isActive ? tab.activeClass : 'text-slate-700 hover:text-slate-900 hover:bg-white/50'}`}>
                  <FontAwesomeIcon icon={tab.icon} />
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? (tab.badgeClass) : (tab.inactiveClass || tab.badgeClass)}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-300">
            <FontAwesomeIcon icon={faSpinner} spin className="text-2xl mb-2 text-slate-400" />
            <p>Cargando incidencias...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 rounded-2xl p-6">{error}</div>
        )}

        {!loading && !error && (
          <div className="xl:col-span-2">
            <IncidentsTable
              incidents={displayedIncidents}
              role={currentUserRole}
              onView={(inc) => openModal('detail', inc)}
              onViewTraceability={(inc) => openModal('traceability', inc)}
              onAssign={(inc) => openModal('assign', inc)}
              onChangeStatus={(inc) => openModal('status', inc)}
              onRequestReassign={(inc) => openModal('reassign', inc)}
              onSelfAssign={handleSelfAssign}
              pendingIncidentIds={pendingIncidentIds}
              onReviewReassignments={() => openModal('manageReassign')}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <IncidentFormModal isOpen={activeModal === 'form'} onClose={closeModal} onSave={cargarIncidencias} />

      <IncidentDetailModal
        isOpen={activeModal === 'detail'}
        incident={selectedIncident}
        currentUserRole={currentUserRole}
        onClose={closeModal}
        onOpenTraceability={(inc) => openModal('traceability', inc)}
        onOpenChangeStatus={(inc) => openModal('status', inc)}
      />

      <IncidentTraceabilityModal isOpen={activeModal === 'traceability'} incident={selectedIncident} onClose={closeModal} />
      <AssignTechnicianModal isOpen={activeModal === 'assign'} incident={selectedIncident} onClose={closeModal} onAssigned={recargar} />
      <ChangeStatusModal isOpen={activeModal === 'status'} incident={selectedIncident} currentUserRole={currentUserRole} onClose={closeModal} onUpdated={recargar} />
      <RequestReassignModal isOpen={activeModal === 'reassign'} incident={selectedIncident} onClose={closeModal} onRequested={recargar} />
      <ManageReassignmentsModal isOpen={activeModal === 'manageReassign'} onClose={closeModal} onProcessed={recargar} />
    </>
  );
}
