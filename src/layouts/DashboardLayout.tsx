import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import { isLoggedIn, logout, onSessionChange, getTimeUntilExpiration } from '../utils/auth';

export default function DashboardLayout() {
  const navigate = useNavigate();

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
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
