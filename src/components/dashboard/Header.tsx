import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUser } from '@fortawesome/free-solid-svg-icons';
import { getCurrentUser } from '../../utils/auth';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const ROLE_NAMES: Record<string, string> = {
  ADMIN: 'Administrador',
  ESTUDIANTE: 'Estudiante',
  TECNICO: 'Técnico',
  TECNICO_GENERAL: 'Técnico General',
  TECNICO_ESPECIALISTA: 'Técnico Especialista',
};

export default function Header({ title, subtitle }: HeaderProps) {

  const usuario = getCurrentUser();
  const currentUserRole = usuario?.rol;
  const roleDisplay = currentUserRole
    ? (ROLE_NAMES[currentUserRole] || currentUserRole.replace(/_/g, ' ').toLowerCase())
    : '';

  return (
    <header className="h-20 shrink-0 border-b border-slate-200 bg-white backdrop-blur-xl flex items-center justify-between px-6">
      <div className="text-left">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
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
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
            <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-slate-800">{usuario?.nombre ?? 'Usuario'}</p>
            <p className="text-xs text-slate-500">{roleDisplay}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
