import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import {
  CheckCheck,
  Clock,
  RotateCw,
  UserCheck,
  CheckCircle2,
  GitPullRequest,
  AlertCircle,
  BellOff,
} from 'lucide-react';
import type { Notificacion } from '../../types/notificacion';
import {
  obtenerNotificaciones,
  obtenerConteoNoLeidas,
  marcarComoLeida,
  marcarTodasComoLeidas,
} from '../../services/notificacionesService';
import { getCurrentUser } from '../../utils/auth';

function tiempoRelativo(fechaIso: string): string {
  try {
    const fecha = new Date(fechaIso);
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    if (isNaN(diffMs)) return '';
    const diffSeg = Math.floor(diffMs / 1000);
    if (diffSeg < 60) return 'Hace un momento';
    const diffMin = Math.floor(diffSeg / 60);
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHoras = Math.floor(diffMin / 60);
    if (diffHoras < 24) return `Hace ${diffHoras} ${diffHoras === 1 ? 'hora' : 'horas'}`;
    const diffDias = Math.floor(diffHoras / 24);
    if (diffDias < 7) return `Hace ${diffDias} ${diffDias === 1 ? 'día' : 'días'}`;
    return fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
  } catch {
    return '';
  }
}

function iconoPorTipo(tipo: string, mensaje: string) {
  switch (tipo) {
    case 'ASIGNACION':
      return <UserCheck className="h-4 w-4 text-blue-600" />;
    case 'REASIGNACION':
      return <RotateCw className="h-4 w-4 text-purple-600" />;
    case 'SOLICITUD_REASIGNACION':
      return <GitPullRequest className="h-4 w-4 text-orange-600" />;
    case 'CAMBIO_ESTADO':
      if (mensaje.toLowerCase().includes('resuelta')) {
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      }
      return <Clock className="h-4 w-4 text-amber-600" />;
    default:
      return <AlertCircle className="h-4 w-4 text-slate-600" />;
  }
}

export default function NotificationsMenu() {
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [conteoNoLeidas, setConteoNoLeidas] = useState(0);
  const [cargando, setCargando] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const actualizarConteo = useCallback(async () => {
    try {
      const total = await obtenerConteoNoLeidas();
      setConteoNoLeidas(total);
    } catch {
      // Silencioso para evitar romper la UI en caso de problemas transitorios
    }
  }, []);

  const cargarNotificaciones = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await obtenerNotificaciones();
      setNotificaciones(datos);
      setConteoNoLeidas(datos.filter((n) => !n.leida).length);
    } catch {
      // Ignorar error transitorio
    } finally {
      setCargando(false);
    }
  }, []);

  // Sondeo periódico cada 30 segundos
  useEffect(() => {
    actualizarConteo();
    const interval = setInterval(() => {
      actualizarConteo();
      if (abierto) {
        cargarNotificaciones();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [actualizarConteo, cargarNotificaciones, abierto]);

  // Cargar lista al abrir
  const toggleMenu = () => {
    if (!abierto) {
      cargarNotificaciones();
    }
    setAbierto((prev) => !prev);
  };

  // Cerrar al hacer click fuera o presionar Esc
  useEffect(() => {
    function handleClickAfuera(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setAbierto(false);
      }
    }
    if (abierto) {
      document.addEventListener('mousedown', handleClickAfuera);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickAfuera);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [abierto]);

  const handleMarcarTodasLeidas = async () => {
    try {
      await marcarTodasComoLeidas();
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      setConteoNoLeidas(0);
    } catch {
      // Error silencioso
    }
  };

  const handleClickNotificacion = async (notif: Notificacion) => {
    if (!notif.leida) {
      try {
        await marcarComoLeida(notif.id);
        setNotificaciones((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, leida: true } : n))
        );
        setConteoNoLeidas((prev) => Math.max(0, prev - 1));
      } catch {
        // Ignorar
      }
    }
    setAbierto(false);

    // Redirigir según el rol del usuario actual
    const rol = getCurrentUser()?.rol;
    if (rol === 'TECNICO_ESPECIALISTA' && notif.tipo === 'ASIGNACION') {
      navigate('/dashboard/mis-incidencias');
    } else {
      navigate('/dashboard/incidencias');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleMenu}
        aria-label={`Notificaciones${conteoNoLeidas > 0 ? `, ${conteoNoLeidas} no leídas` : ''}`}
        aria-haspopup="true"
        aria-expanded={abierto}
        className="relative w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
      >
        <FontAwesomeIcon icon={faBell} />
        {conteoNoLeidas > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm animate-in fade-in zoom-in duration-200">
            {conteoNoLeidas > 99 ? '99+' : conteoNoLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">Notificaciones</span>
              {conteoNoLeidas > 0 && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                  {conteoNoLeidas} nueva{conteoNoLeidas > 1 ? 's' : ''}
                </span>
              )}
            </div>
            {conteoNoLeidas > 0 && (
              <button
                type="button"
                onClick={handleMarcarTodasLeidas}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Marcar leídas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {cargando && notificaciones.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Cargando notificaciones…
              </div>
            ) : notificaciones.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <BellOff className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-slate-700">Sin notificaciones</p>
                <p className="mt-1 text-xs text-slate-400">
                  Te avisaremos cuando haya actualizaciones sobre tus tickets.
                </p>
              </div>
            ) : (
              notificaciones.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleClickNotificacion(notif)}
                  className={`flex items-start gap-3 p-3.5 transition-colors cursor-pointer ${
                    notif.leida ? 'hover:bg-slate-50 opacity-80' : 'bg-blue-50/40 hover:bg-blue-50/70'
                  }`}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200/80 shadow-xs">
                    {iconoPorTipo(notif.tipo, notif.mensaje)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {notif.titulo}
                      </p>
                      {!notif.leida && (
                        <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.mensaje}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {notif.codigoTicket && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-600">
                          {notif.codigoTicket}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        {tiempoRelativo(notif.fechaCreacion)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

