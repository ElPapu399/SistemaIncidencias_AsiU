import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUser } from '@fortawesome/free-solid-svg-icons';
import { Menu } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import type { MenuContext } from '../../layouts/DashboardLayout';
import { getCurrentUser } from '../../utils/auth';

interface HeaderProps {
  title: string;
  subtitle?: string;
  nombreUsuario?: string;
}

const ROLE_NAMES: Record<string, string> = {
  ADMIN: 'Administrador',
  ESTUDIANTE: 'Estudiante',
  TECNICO: 'Técnico',
  TECNICO_GENERAL: 'Técnico General',
  TECNICO_ESPECIALISTA: 'Técnico Especialista',
};

export default function Header({ title, subtitle, nombreUsuario }: HeaderProps) {

  const {menuAbierto, abrirMenu} = useOutletContext<MenuContext>();
  const usuario = getCurrentUser();
  const currentUserRole = usuario?.rol;
  const roleDisplay = currentUserRole
    ? (ROLE_NAMES[currentUserRole] || currentUserRole.replace(/_/g, ' ').toLowerCase())
    : '';

  return (
    <header className="sticky top-0 z-30 h-20 shrink-0 border-b border-slate-200 bg-white backdrop-blur-xl flex items-center justify-between px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={abrirMenu}
          aria-label="Abrir menú"
          aria-expanded={menuAbierto}
          aria-controls="sidebar"
          className="shrink-0 rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
        >
          <Menu className="h-6 w-6" aria-hidden="true"/>
        </button>

        <div className="min-w-0 text-left">
          <h2 className="text-lg font-bold text-slate-900">
            {title}
          </h2>
          {subtitle && (
            <p className="hidden sm:block text-xs text-slate-500">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">

        <button
          type="button"
          aria-label="Notificaciones"
          className="relative w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon icon={faBell} />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
            <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-slate-800">{nombreUsuario ?? usuario?.nombre ?? 'Usuario'}</p>
            <p className="text-xs text-slate-500">{roleDisplay}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
