import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faClipboardList,
  faUser,
  faUserGroup,
  faPlus,
  faChartBar,
  faGear,
  faGraduationCap,
  faDesktop,
  faRightFromBracket,
  faStar,
  faUsersGear,
  faCircleQuestion,
  faWrench,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import { getCurrentUser, logout } from "../../utils/auth";

const ALL_TECNICOS = ["TECNICO", "TECNICO_GENERAL", "TECNICO_ESPECIALISTA"];

interface SidebarProps {
  onClose: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const navigate = useNavigate();

  const usuario = getCurrentUser();
  const currentUserRole = usuario?.rol;

  const navItems = [
    {
      to: "/dashboard",
      label: "Inicio",
      icon: faHome,
      end: true,
      tourId: "sidebar-inicio",
      roles: ["ADMIN", "ESTUDIANTE", ...ALL_TECNICOS],
    },
    {
      to: "/dashboard/nueva",
      label: "Registrar incidencia",
      icon: faPlus,
      tourId: "sidebar-nueva",
      roles: ["ESTUDIANTE"],
    },
    {
      to: "/dashboard/incidencias",
      label: {
        ADMIN: "Incidencias",
        ESTUDIANTE: "Mis incidencias",
        TECNICO: "Incidencias",
        TECNICO_GENERAL: "Gestión de incidencias",
        TECNICO_ESPECIALISTA: "Incidencias",
      } as Record<string, string>,
      icon: faClipboardList,
      tourId: "sidebar-incidencias",
      roles: ["ADMIN", "ESTUDIANTE", ...ALL_TECNICOS],
    },
    {
      to: "/dashboard/carga-tecnicos",
      label: "Carga de trabajo",
      icon: faUsersGear,
      tourId: "sidebar-carga-tecnicos",
      roles: ["TECNICO_GENERAL"],
    },
    {
      to: "/dashboard/usuarios",
      label: "Usuarios",
      icon: faUserGroup,
      tourId: "sidebar-usuarios",
      roles: ["ADMIN"],
    },
    {
      to: "/dashboard/laboratorios",
      label: "Laboratorios",
      icon: faDesktop,
      tourId: "sidebar-laboratorios",
      roles: ["ADMIN", "TECNICO_GENERAL", "TECNICO_ESPECIALISTA"],
    },
    {
      to: "/dashboard/taller-equipos",
      label: "Taller de equipos",
      icon: faWrench,
      tourId: "sidebar-taller",
      roles: ["TECNICO_ESPECIALISTA"],
    },
    {
      to: "/dashboard/mi-rendimiento",
      label: "Mi rendimiento",
      icon: faChartLine,
      tourId: "sidebar-mi-rendimiento",
      roles: ["TECNICO_ESPECIALISTA", "TECNICO"],
    },
    {
      to: "/dashboard/reportes",
      label: "Reportes",
      icon: faChartBar,
      tourId: "sidebar-reportes",
      roles: ["ADMIN"],
    },
    {
      to: "/dashboard/calificaciones-tecnicos",
      label: {
        ADMIN: "Calificaciones",
        TECNICO: "Mis Calificaciones",
        TECNICO_ESPECIALISTA: "Mis Calificaciones",
      } as Record<string, string>,
      icon: faStar,
      tourId: "sidebar-calificaciones",
      roles: ["ADMIN", "TECNICO_ESPECIALISTA", "TECNICO"],
    },
    {
      to: "/dashboard/configuracion",
      label: "Configuración",
      icon: faGear,
      tourId: "sidebar-configuracion",
      roles: ["ADMIN"],
    },
    {
      to: "/dashboard/ayuda",
      label: "Centro de ayuda",
      icon: faCircleQuestion,
      tourId: "sidebar-ayuda",
      roles: ["ESTUDIANTE"],
    },
    {
      to: "/dashboard/perfil",
      label: "Perfil",
      icon: faUser,
      tourId: "sidebar-perfil",
      roles: ["ADMIN", "ESTUDIANTE", ...ALL_TECNICOS],
    },
  ];


  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const visibleNavItems = navItems.filter((item) =>
    currentUserRole ? item.roles.includes(currentUserRole) : false,
  );

  return (
    <div className="w-64 shrink-0 bg-blue-900/50 border-r border-slate-800 flex flex-col relative overflow-hidden h-full">
      <div data-tour="sidebar-logo" className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <FontAwesomeIcon
              icon={faGraduationCap}
              className="text-slate-950 text-xl"
            />
          </div>
          <div className="text-left">
            <div className="text-lg font-bold text-white leading-tight mt-1">
              ASIU
            </div>
            <div className="hidden lg:block text-[10px] uppercase tracking-widest text-slate-400 font-semibold -mt-1">
              Incidencias Universitarias
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar menú"
          className="
              ml-auto inline-flex h-7 w-7 shrink-0
              items-center justify-center rounded-lg
              border border-red-500/60
              bg-red-500/30 text-red-400
              hover:bg-red-500/30 hover:text-red-300
              transition-colors cursor-pointer md:hidden"
        >
          <span aria-hidden="true" className="text-lg leading-none">
            x
          </span>
        </button>
      </div>

      <nav data-tour="sidebar-nav" className="flex-1 min-h-0 overflow-y-auto p-4 space-y-0.5">
        {visibleNavItems.map(({ to, label, icon, end, tourId }) => {
          const displayLabel =
            typeof label === "string"
              ? label
              : (label[currentUserRole ?? ""] ?? "");
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              data-tour={tourId}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-linear-to-r from-yellow-400/10 to-orange-500/10 text-yellow-400 border border-orange-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`
              }
            >
              <FontAwesomeIcon icon={icon} className="w-4 h-4" />
              {displayLabel}
            </NavLink>
          );
        })}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium text-slate-400 hover:text-white hover:bg-red-800/20 transition-all duration-200 cursor-pointer"
        >
          <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
          Cerrar Sesión
        </button>
        <div className="pt-3">
          <div className="bg-slate-900/80 rounded-xl py-5 text-center flex flex-col gap-0.5">
            <p className="text-[14px] text-slate-500 uppercase tracking-wider font-semibold leading-none">
              Periodo
            </p>
            <p className="text-[17px] text-slate-200 font-medium">
              2026 - Semestre II
            </p>
          </div>
        </div>
        <div className="absolute bottom-48 left-10 w-90 h-90 bg-blue-300/10 rounded-full pointer-events-none" />
        <div className="absolute top-24 -left-18 w-62 h-62 bg-blue-300/10 rounded-full pointer-events-none" />
      </nav>
    </div>
  );
}
