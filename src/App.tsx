import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardLayout from './layouts/DashboardLayout';

const IncidenciasPage = lazy(() => import('./pages/IncidenciasPage'));
const UsuariosPage = lazy(() => import('./pages/UsuariosPage'));
const NuevaIncidenciaPage = lazy(() => import('./pages/NuevaIncidenciaPage'));
const LaboratoriosPage = lazy(() => import('./pages/LaboratoriosPage'));
const LaboratorioDetallePage = lazy(() => import('./pages/LaboratorioDetallePage'));
const Configuracion = lazy(() => import('./pages/Configuracion'));
const Perfil = lazy(() => import('./pages/Perfil'));
const HistorialPage = lazy(() => import('./pages/HistorialPage'));
const ReportesPage = lazy(() => import('./pages/ReportesPage'));
const CalificacionesTecnicosPage = lazy(() => import('./pages/CalificacionesTecnicosPage'));
const CargaTecnicosPage = lazy(() => import('./pages/CargaTecnicosPage'));
const CentroAyudaPage = lazy(() => import('./pages/CentroAyudaPage'));
const TallerEquiposPage = lazy(() => import('./pages/TallerEquiposPage'));
const MiRendimientoPage = lazy(() => import('./pages/MiRendimientoPage'));

function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route
          path="incidencias"
          element={
            <Suspense fallback={<PageLoader />}>
              <IncidenciasPage
                title="Todas las Incidencias"
                description="Aquí podrás consultar, filtrar y gestionar todas las incidencias del campus."
              />
            </Suspense>
          }
        />
        <Route
          path="mis-incidencias"
          element={
            <Suspense fallback={<PageLoader />}>
              <IncidenciasPage
                title="Mis Incidencias Asignadas"
                description="Consulta, atiende y da seguimiento a las incidencias asignadas a tu cuenta."
                soloMisIncidencias={true}
              />
            </Suspense>
          }
        />
        <Route
          path="usuarios"
          element={
            <Suspense fallback={<PageLoader />}>
              <UsuariosPage
                title="Usuarios"
                description="Gestión integral de estudiantes y personal técnico."
              />
            </Suspense>
          }
        />
        <Route
          path="tecnicos"
          element={<Navigate to="/dashboard/usuarios?tab=tecnicos" replace />}
        />
        <Route
          path="carga-tecnicos"
          element={
            <Suspense fallback={<PageLoader />}>
              <CargaTecnicosPage />
            </Suspense>
          }
        />
        <Route
          path="laboratorios"
          element={
            <Suspense fallback={<PageLoader />}>
              <LaboratoriosPage
                title="Laboratorios"
                description="Gestión de los laboratorios de la universidad."
              />
            </Suspense>
          }
        />
        <Route
          path="laboratorios/:laboratorioId"
          element={
            <Suspense fallback={<PageLoader />}>
              <LaboratorioDetallePage />
            </Suspense>
          }
        />
        <Route
          path="nueva"
          element={
            <Suspense fallback={<PageLoader />}>
              <NuevaIncidenciaPage />
            </Suspense>
          }
        />
        <Route
          path="reportes"
          element={
            <Suspense fallback={<PageLoader />}>
              <ReportesPage />
            </Suspense>
          }
        />
        <Route
          path="configuracion"
          element={
            <Suspense fallback={<PageLoader />}>
              <Configuracion />
            </Suspense>
          }
        />
        <Route
          path="historial"
          element={
            <Suspense fallback={<PageLoader />}>
              <HistorialPage
                title="Historial"
                description="Consulta las incidencias resueltas o cerradas del campus."
              />
            </Suspense>
          }
        />
        <Route
          path="calificaciones-tecnicos"
          element={
            <Suspense fallback={<PageLoader />}>
              <CalificacionesTecnicosPage />
            </Suspense>
          }
        />
        <Route
          path="taller-equipos"
          element={
            <Suspense fallback={<PageLoader />}>
              <TallerEquiposPage />
            </Suspense>
          }
        />
        <Route
          path="mi-rendimiento"
          element={
            <Suspense fallback={<PageLoader />}>
              <MiRendimientoPage />
            </Suspense>
          }
        />
        <Route
          path="ayuda"
          element={
            <Suspense fallback={<PageLoader />}>
              <CentroAyudaPage />
            </Suspense>
          }
        />
        <Route
          path="perfil"
          element={
            <Suspense fallback={<PageLoader />}>
              <Perfil />
            </Suspense>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
