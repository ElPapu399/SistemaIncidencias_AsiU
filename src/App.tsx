import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardLayout from './layouts/DashboardLayout';

import PlaceholderPage from './pages/PlaceholderPage';
import IncidenciasPage from './pages/IncidenciasPage';
import EstudiantesPage from './pages/EstudiantesPage';
import TecnicosPage from './pages/TecnicosPage';
import NuevaIncidenciaPage from './pages/NuevaIncidenciaPage';

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
              title="Incidencias"
              description="Aquí podrás consultar, filtrar y gestionar todas las incidencias del campus."
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
            <PlaceholderPage
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
          element={
            <PlaceholderPage
              title="Reportes"
              description="Estadísticas y reportes detallados del sistema de incidencias."
            />
          }
        />
        <Route
          path="configuracion"
          element={
            <PlaceholderPage
              title="Configuración"
              description="Ajustes del sistema, usuarios, categorías y permisos."
            />
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
