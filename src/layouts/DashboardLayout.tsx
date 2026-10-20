import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import { isLoggedIn, logout, onSessionChange, getTimeUntilExpiration } from '../utils/auth';

export interface MenuContext {
  menuAbierto: boolean;
  abrirMenu: () => void;
}

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/', { replace: true });
      return;
    }

    const unsubscribeSession = onSessionChange((user) => {
      if (!user) {
        navigate('/', { replace: true });
      }
    });

    const msRemaining = getTimeUntilExpiration();
    let expirationTimer: ReturnType<typeof setTimeout> | undefined;

    if (msRemaining !== null) {
      expirationTimer = setTimeout(() => {
        logout();
        navigate('/', { replace: true });
      }, msRemaining);
    }

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
      {menuAbierto && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setMenuAbierto(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      <div
        id="sidebar"
        className={`
            fixed inset-y-0 left-0 z-50 w-64 h-dvh bg-slate-950
            md:sticky md:top-0 md:z-auto md:block md:shrink-0
            ${menuAbierto ? 'block' : 'hidden'}
          `}
      >
        <Sidebar onClose={() => setMenuAbierto(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Outlet
          context={{
            menuAbierto,
            abrirMenu: () => setMenuAbierto(true),
          } satisfies MenuContext}
        />
      </div>
    </div>
  );
}
