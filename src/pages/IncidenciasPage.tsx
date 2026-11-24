import Button, { ButtonLink } from '../components/Button';
import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Check,
  Loader2,
  ClipboardCheck,
  Handshake,
  ListFilter,
  ArrowRightLeft,
} from 'lucide-react';

import Header from '../components/dashboard/Header';
import IncidentsTable from '../components/dashboard/IncidentsTable';
import IncidentFormModal from '../components/dashboard/IncidentForm';
import AssignTechnicianModal from '../components/dashboard/AssignTechnicianModal';
import ChangeStatusModal from '../components/dashboard/ChangeStatusModal';
import RequestReassignModal from '../components/dashboard/RequestReassignModal';
import ManageReassignmentsModal from '../components/dashboard/ManageReassignmentsModal';
import IncidentDetailModal from '../components/dashboard/IncidentDetailModal';
import IncidentTraceabilityModal from '../components/dashboard/IncidentTraceabilityModal';
import RateIncidentModal from '../components/dashboard/RateIncidentModal';

import {
  obtenerIncidencias, obtenerIncidenciasPorEstudiante, obtenerIncidenciasPorTecnico,
  obtenerSolicitudesPendientes, asignarTecnico, type SolicitudReasignacion,
} from '../services/incidenciasService';
import type { Incident } from '../types/incident';
import { getCurrentUser } from '../utils/auth';
import { TableSkeleton } from '../components/dashboard/SkeletonLoaders';

const CLOSED_STATUSES = ['Resuelta', 'Resuelto', 'Cerrada', 'Cancelado'];

type ModalKey = 'form' | 'detail' | 'traceability' | 'assign' | 'status' | 'reassign' | 'manageReassign' | 'rate' | 'selfAssign' | null;

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
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [selfAssigning, setSelfAssigning] = useState(false);

  const usuario = getCurrentUser();
  const currentUserRole = usuario?.rol;
  const isEstudiante = currentUserRole === 'ESTUDIANTE';
  const isSupportOrAdmin = currentUserRole === 'ADMIN' || currentUserRole === 'TECNICO_GENERAL';
  const isTecnicoEspecialista = currentUserRole === 'TECNICO_ESPECIALISTA' || currentUserRole === 'TECNICO';

  const [tecnicoFilter, setTecnicoFilter] = useState<'all' | 'mine' | 'available'>(
    soloMisIncidencias || isTecnicoEspecialista ? 'mine' : 'all'
  );

  const [activeModal, setActiveModal] = useState<ModalKey>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const [prevSoloMisIncidencias, setPrevSoloMisIncidencias] = useState(soloMisIncidencias);
  if (soloMisIncidencias !== prevSoloMisIncidencias) {
    setPrevSoloMisIncidencias(soloMisIncidencias);
    setTecnicoFilter(soloMisIncidencias || isTecnicoEspecialista ? 'mine' : 'all');
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

  const openModal = useCallback((modal: ModalKey, incident?: Incident) => {
    if (incident) setSelectedIncident(incident);
    setActiveModal(modal);
  }, []);

  const closeModal = useCallback(() => { setActiveModal(null); setSelectedIncident(null); }, []);

  const pendingIncidentIds = useMemo(
    () => new Set(solicitudesPendientes.map((s) => s.incidenciaId)),
    [solicitudesPendientes]
  );

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

  const handleSelfAssign = useCallback((incident: Incident) => {
    if (!incident.numericId || !usuario?.id) return;
    setSelectedIncident(incident);
    setActiveModal('selfAssign');
  }, [usuario?.id]);

  const confirmSelfAssign = useCallback(async () => {
    if (!selectedIncident?.numericId || !usuario?.id) return;
    setSelfAssigning(true);
    try {
      await asignarTecnico(selectedIncident.numericId, usuario.id);
      setSuccessToast(`¡Te has autoasignado la incidencia ${selectedIncident.id} correctamente!`);
      setTimeout(() => setSuccessToast(null), 4000);
      closeModal();
      recargar();
    } catch (err: unknown) {
      setErrorToast(err instanceof Error ? err.message : 'Error al autoasignarse la incidencia');
      setTimeout(() => setErrorToast(null), 5000);
      closeModal();
    } finally {
      setSelfAssigning(false);
    }
  }, [selectedIncident, usuario?.id, recargar, closeModal]);

  const pageTitle = isEstudiante ? 'Mis Incidencias'
    : isTecnicoEspecialista
      ? (tecnicoFilter === 'mine' ? 'Mis Incidencias Asignadas' : tecnicoFilter === 'available' ? 'Incidencias Disponibles' : 'Todas las Incidencias')
    : currentUserRole === 'TECNICO_GENERAL' ? 'Gestión de Incidencias'
    : title || 'Incidencias';

  const pageSubtitle = isEstudiante
    ? 'Consulta, filtra y da seguimiento al estado de tus incidencias reportadas en el campus.'
    : isTecnicoEspecialista
      ? (tecnicoFilter === 'mine'
          ? 'Consulta y atiende únicamente las incidencias asignadas a tu cuenta como técnico especialista.'
          : tecnicoFilter === 'available'
            ? 'Incidencias sin asignar o pendientes que puedes autoasignarte para atender en el campus.'
            : 'Consulta el panorama de todas las incidencias del campus.')
    : currentUserRole === 'TECNICO_GENERAL'
      ? 'Bandeja de triaje: delega incidencias a técnicos especialistas y gestiona reasignaciones.'
    : description || 'Gestión de incidencias del campus.';

  const sectionHeading = isEstudiante ? 'Mis Incidencias Reportadas'
    : isTecnicoEspecialista
      ? (tecnicoFilter === 'mine' ? 'Mis Incidencias Asignadas' : tecnicoFilter === 'available' ? 'Incidencias Disponibles para Tomar' : 'Todas las Incidencias del Campus')
    : currentUserRole === 'TECNICO_GENERAL' ? 'Bandeja de Triaje y Delegación'
    : 'Gestión de Incidencias';

  const n = displayedIncidents.length;
  const countLabel = loading ? 'Cargando incidencias...'
    : `${n} incidencia${n !== 1 ? 's' : ''} ${soloMisIncidencias ? 'asignada' : isEstudiante ? 'reportada' : 'registrada'}${n !== 1 ? 's' : ''}`;

  const tecnicoTabs = [
    { key: 'mine' as const, label: 'Mis asignadas', icon: ClipboardCheck, count: myAssignedCount, activeClass: 'bg-violet-600 text-white shadow-sm', badgeClass: 'bg-violet-500 text-white', inactiveClass: 'bg-(--tone-violet-bg-100) text-(--tone-violet-text-800)' },
    { key: 'available' as const, label: 'Disponibles para tomar', icon: Handshake, count: availableCount, activeClass: 'bg-emerald-600 text-white shadow-sm', badgeClass: 'bg-emerald-500 text-white', inactiveClass: 'bg-(--tone-emerald-bg-100) text-(--tone-emerald-text-800)' },
    { key: 'all' as const, label: 'Todas las incidencias', icon: ListFilter, count: incidents.length, activeClass: 'bg-(--surface) text-(--text-primary) shadow-sm', badgeClass: 'bg-(--surface-muted) text-(--text-primary)' },
  ];

  return (
    <>
      <Header title={pageTitle} subtitle={pageSubtitle} />

      <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-(--app-bg)">
        {/* Header section */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 text-left">
            <h3 className="text-2xl font-bold text-(--text-primary)">{sectionHeading}</h3>
            <p className="text-sm text-(--text-secondary) mt-1">{countLabel}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {isEstudiante && (
              <ButtonLink variant="create" appearance="solid" size="custom"
                to="/dashboard/nueva"
                aria-label="Nueva incidencia"
                title="Nueva incidencia"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-xl p-0 font-semibold text-xs shadow-xs transition-colors cursor-pointer sm:h-auto sm:w-auto sm:px-4 sm:py-2.5"
              >
                <Plus className="h-4 w-4 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Nueva incidencia</span>
              </ButtonLink>
            )}
          </div>
        </div>

        {/* Toast */}
        {successToast && (
          <div className="bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center justify-between text-sm font-semibold animate-fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-white" />
              <span>{successToast}</span>
            </div>
            <Button variant="cancel" appearance="soft" size="custom" onClick={() => setSuccessToast(null)} className="ml-4 text-xs underline cursor-pointer">Cerrar</Button>
          </div>
        )}

        {/* Banner reasignaciones */}
        {isSupportOrAdmin && solicitudesPendientes.length > 0 && (
          <div className="bg-linear-to-r from-(--tone-violet-bg-50) to-(--tone-purple-bg-50) border border-(--tone-violet-border-200) rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-(--tone-violet-bg-100) border border-(--tone-violet-border-200) flex items-center justify-center text-(--tone-violet-text-700) shrink-0">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-(--text-primary)">
                  {solicitudesPendientes.length === 1
                    ? 'Tienes 1 solicitud de reasignación pendiente'
                    : `Tienes ${solicitudesPendientes.length} solicitudes de reasignación pendientes`}
                </h4>
                <p className="text-xs text-(--text-secondary)">Técnicos especialistas han solicitado transferir incidencias. Puedes revisarlas y reasignar o rechazar.</p>
              </div>
            </div>
            <Button variant="assignment" appearance="solid" size="custom" type="button" onClick={() => openModal('manageReassign')} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0">
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Revisar Solicitudes ({solicitudesPendientes.length})</span>
            </Button>
          </div>
        )}

        {/* Tabs técnico especialista */}
        {isTecnicoEspecialista && !soloMisIncidencias && (
          <div className="flex w-full items-center gap-2 p-1 bg-(--surface-hover)/80 rounded-2xl sm:w-fit">
            {tecnicoTabs.map((tab) => {
              const isActive = tecnicoFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setTecnicoFilter(tab.key)}
                  aria-label={`${tab.label}: ${tab.count}`}
                  aria-pressed={isActive}
                  title={tab.label}
                  className={`inline-flex flex-1 sm:flex-none items-center justify-center gap-3 sm:gap-2 min-w-0
                    px-3 sm:px-4 py-3 sm:py-2 rounded-xl text-sm sm:text-xs font-bold
                    transition-all cursor-pointer ${
                      isActive
                        ? tab.activeClass
                        : 'text-(--text-primary) hover:text-(--text-primary) hover:bg-(--surface)/50'
                    }`}
                >
                  <tab.icon className="w-4 h-4 text-lg sm:text-sm shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs sm:text-[10px] ${isActive ? (tab.badgeClass) : (tab.inactiveClass || tab.badgeClass)}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {loading && (
          <TableSkeleton rows={6} showFilters={true} />
        )}

        {error && (
          <div className="bg-(--tone-red-bg-100) border border-(--tone-red-border-300) text-(--tone-red-text-700) rounded-2xl p-6">{error}</div>
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
              onRate={(inc) => openModal('rate', inc)}
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
        currentUserId={usuario?.id}
        onClose={closeModal}
        onOpenTraceability={(inc) => openModal('traceability', inc)}
        onOpenChangeStatus={(inc) => openModal('status', inc)}
        onRate={(inc) => openModal('rate', inc)}
      />

      <IncidentTraceabilityModal isOpen={activeModal === 'traceability'} incident={selectedIncident} onClose={closeModal} />
      <AssignTechnicianModal isOpen={activeModal === 'assign'} incident={selectedIncident} onClose={closeModal} onAssigned={recargar} />
      <ChangeStatusModal isOpen={activeModal === 'status'} incident={selectedIncident} currentUserRole={currentUserRole} onClose={closeModal} onUpdated={recargar} />
      <RequestReassignModal isOpen={activeModal === 'reassign'} incident={selectedIncident} onClose={closeModal} onRequested={recargar} />
      <ManageReassignmentsModal isOpen={activeModal === 'manageReassign'} onClose={closeModal} onProcessed={recargar} />
      <RateIncidentModal isOpen={activeModal === 'rate'} incident={selectedIncident} onClose={closeModal} onRated={recargar} />

      {/* Self-assign confirmation modal */}
      {activeModal === 'selfAssign' && selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-(--surface) rounded-2xl shadow-2xl border border-(--border-color) w-full max-w-md z-10 overflow-hidden">
            <div className="px-6 py-5 border-b border-(--border-color) bg-linear-to-r from-(--tone-emerald-bg-50) to-(--tone-teal-bg-50)">
              <h3 className="text-base font-bold text-(--text-primary)">Autoasignar incidencia</h3>
              <p className="text-xs text-(--text-secondary) mt-0.5">Confirma que deseas tomar esta incidencia</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-(--surface-subtle) border border-(--border-color)/70 rounded-xl p-3">
                <p className="text-xs text-(--text-secondary) font-semibold uppercase tracking-wider">Incidencia</p>
                <p className="text-sm text-(--text-primary) font-medium mt-0.5">
                  <span className="font-mono text-xs font-bold text-(--tone-emerald-text-600) bg-(--tone-emerald-bg-100) px-2 py-0.5 rounded-lg border border-(--tone-emerald-border-200) mr-2">{selectedIncident.id}</span>
                  {selectedIncident.title}
                </p>
              </div>
              <p className="text-sm text-(--text-secondary)">
                Al autoasignarte, esta incidencia quedará bajo tu responsabilidad y pasará a estado <span className="font-semibold text-(--text-primary)">"Asignada"</span>.
              </p>
            </div>
            <div className="px-6 py-4 bg-(--surface-subtle) border-t border-(--border-color) flex items-center justify-end gap-3">
              <Button variant="cancel" appearance="soft" size="custom"
                type="button"
                onClick={closeModal}
                disabled={selfAssigning}
                className="px-4 py-2 text-xs font-bold border rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </Button>
              <Button variant="assignment" appearance="solid" size="custom"
                type="button"
                onClick={confirmSelfAssign}
                disabled={selfAssigning}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
              >
                {selfAssigning ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>{selfAssigning ? 'Asignando...' : 'Sí, tomar incidencia'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error toast */}
      {errorToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-red-600 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2 animate-[slideUp_0.3s_ease-out]">
          <span>⚠️</span>
          <span>{errorToast}</span>
          <Button variant="cancel" appearance="soft" size="custom" type="button" onClick={() => setErrorToast(null)} className="ml-2 cursor-pointer">✕</Button>
        </div>
      )}
    </>
  );
}
