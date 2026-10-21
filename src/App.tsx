import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardLayout from './layouts/DashboardLayout';

import IncidenciasPage from './pages/IncidenciasPage';
import EstudiantesPage from './pages/EstudiantesPage';
import TecnicosPage from './pages/TecnicosPage';
import NuevaIncidenciaPage from './pages/NuevaIncidenciaPage';
import LaboratoriosPage from './pages/LaboratoriosPage';
import Configuracion from './pages/Configuracion';
import Perfil from './pages/Perfil';
import HistorialPage from './pages/HistorialPage';
import ReportesPage from './pages/ReportesPage';
import CalificacionesTecnicosPage from './pages/CalificacionesTecnicosPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route
          path="incidencias"
          element={
            <IncidenciasPage
              title="Todas las Incidencias"
              description="Aquí podrás consultar, filtrar y gestionar todas las incidencias del campus."
            />
          }
        />
        <Route
          path="mis-incidencias"
          element={
            <IncidenciasPage
              title="Mis Incidencias Asignadas"
              description="Consulta, atiende y da seguimiento a las incidencias asignadas a tu cuenta."
              soloMisIncidencias={true}
            />
          }
        />
        <Route
          path="usuarios"
          element={
            <EstudiantesPage
              title="Estudiantes"
              description="Gestión de usuarios del sistema."
            />
          }
        />
        <Route
          path="tecnicos"
          element={
            <TecnicosPage
              title="Tecnicos"
              description="Gestión de tecnicos de soporte del sistema."
            />
          }
        />
        <Route
          path="laboratorios"
          element={
            <LaboratoriosPage
              title="Laboratorios"
              description="Gestión de los laboratorios de la universidad."
            />
          }
        />
        <Route
          path="nueva"
          element={<NuevaIncidenciaPage />}
        />
        <Route
          path="reportes"
          element={<ReportesPage />}
        />
        <Route
          path="configuracion"
          element={<Configuracion />}
        />
        <Route
          path="historial"
          element={
            <HistorialPage
              title="Historial"
              description="Consulta las incidencias resueltas o cerradas del campus."
            />
          }
        />
        <Route
          path="calificaciones-tecnicos"
          element={
            <CalificacionesTecnicosPage
              title="Calificaciones de Técnicos"
              description="Consulta el desempeño y los comentarios de los técnicos de soporte."
            />
          }
        />
        <Route
          path="perfil"
          element={<Perfil/>}
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
