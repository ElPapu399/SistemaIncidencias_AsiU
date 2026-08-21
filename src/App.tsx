import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PlaceholderPage from './pages/PlaceholderPage';
import DashboardLayout from './layouts/DashboardLayout';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route
          path="incidencias"
          element={
            <PlaceholderPage
              title="Incidencias"
              description="Aquí podrás consultar, filtrar y gestionar todas las incidencias del campus."
            />
          }
        />
        <Route
          path="usuarios"
          element={
            <PlaceholderPage
              title="Usuarios"
              description="Podrás ver cuántos usuarios están en el sistema."
            />
          }
        />
        <Route
          path="nueva"
          element={
            <PlaceholderPage
              title="Nueva incidencia"
              description="Formulario para registrar una nueva incidencia universitaria."
            />
          }
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
