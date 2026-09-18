import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import { isLoggedIn, logout, onSessionChange, getTimeUntilExpiration } from '../utils/auth';

export default function DashboardLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Guardia de sesión: si no hay sesión válida o ya expiró, ir al login
    if (!isLoggedIn()) {
      navigate('/', { replace: true });
      return;
    }

    // 2. Sincronización entre pestañas: si se cierra sesión en otra pestaña, cerrar aquí
    const unsubscribeSession = onSessionChange((user) => {
      if (!user) {
        navigate('/', { replace: true });
      }
    });

    // 3. Temporizador de expiración exacta de la sesión (JWT exp)
    const msRemaining = getTimeUntilExpiration();
    let expirationTimer: ReturnType<typeof setTimeout> | undefined;

    if (msRemaining !== null) {
      expirationTimer = setTimeout(() => {
        logout();
        navigate('/', { replace: true });
      }, msRemaining);
    }

    // 4. Verificación periódica cada 15 segundos (por si la máquina entra en suspensión)
    const interval = setInterval(() => {
      if (!isLoggedIn()) {
        logout();
        navigate('/', { replace: true });
      }
    }, 15000);

    return () => {
      unsubscribeSession();
      if (expirationTimer) clearTimeout(expirationTimer);
      clearInterval(interval);
    };
  }, [navigate]);

  if (!isLoggedIn()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
