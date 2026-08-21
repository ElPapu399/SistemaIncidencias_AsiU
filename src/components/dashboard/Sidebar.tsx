import { NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faClipboardList,
  faUser,
  faPlus,
  faChartBar,
  faGear,
  faGraduationCap,
} from '@fortawesome/free-solid-svg-icons';

const navItems = [
  { to: '/dashboard', label: 'Inicio', icon: faChartLine, end: true },
  { to: '/dashboard/incidencias', label: 'Incidencias', icon: faClipboardList },
  { to: '/dashboard/usuarios', label: 'Usuarios', icon: faUser },
  { to: '/dashboard/nueva', label: 'Nueva incidencia', icon: faPlus },
  { to: '/dashboard/reportes', label: 'Reportes', icon: faChartBar },
  { to: '/dashboard/configuracion', label: 'Configuración', icon: faGear },
];

export default function Sidebar() {

  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  }

  return (
    <div className="w-64 bg-blue-900/50 border-r border-slate-800 flex flex-col">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <FontAwesomeIcon icon={faGraduationCap} className="text-slate-950 text-xl" />
          </div>
          <div className="text-left">
            <div className="text-lg font-bold text-white leading-tight mt-1">ASIU</div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold -mt-1">
              Incidencias Universitarias
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-yellow-400/10 to-orange-500/10 text-yellow-400 border border-orange-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`
            }
          >
            <FontAwesomeIcon icon={icon} className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-900/60 rounded-xl p-4 text-left">
          <div className="mb-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Periodo</p>
            <p className="text-sm text-slate-200 mt-1 font-medium">2026 - Semestre II</p>
          </div>
          <div className="p-3 border-t border-sidebar-border flex-shrink-0">
            <button onClick={() => navigate("/src/pages/Login.tsx")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white hover:bg-red-500/10 hover:text-red-400 transition-colors">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
