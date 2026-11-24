import Button from '../Button';
import { Menu, User } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import type { MenuContext } from '../../layouts/DashboardLayout';
import { getCurrentUser } from '../../utils/auth';
import NotificationsMenu from './NotificationsMenu';
import ThemeToggle from '../../dashboard/ThemeToggle';

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

  const { menuAbierto, abrirMenu } = useOutletContext<MenuContext>();
  const usuario = getCurrentUser();
  const currentUserRole = usuario?.rol;
  const roleDisplay = currentUserRole
    ? (ROLE_NAMES[currentUserRole] || currentUserRole.replace(/_/g, ' ').toLowerCase())
    : '';

  return (
    <header className="sticky top-0 z-30 h-20 shrink-0 border-b border-(--border-color) bg-(--surface) backdrop-blur-xl flex items-center justify-between px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button variant="neutral" appearance="text" size="custom"
          type="button"
          onClick={abrirMenu}
          aria-label="Abrir menú"
          aria-expanded={menuAbierto}
          aria-controls="sidebar"
          className="shrink-0 rounded-lg p-2 md:hidden"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </Button>

        <div className="min-w-0 text-left">
          <h2 className="text-lg font-bold text-(--text-primary)">
            {title}
          </h2>
          {subtitle && (
            <p className="hidden sm:block text-xs text-(--text-secondary)">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <ThemeToggle/>
        <NotificationsMenu />

        <div data-tour="header-user-info" className="flex items-center gap-3 pl-4 border-l border-(--border-color)">
          <div data-tour="header-user-avatar" className="w-9 h-9 rounded-xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
            <User className="text-white h-4 w-4" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-(--text-primary)">{nombreUsuario ?? usuario?.nombre ?? 'Usuario'}</p>
            <p className="text-xs text-(--text-secondary)">{roleDisplay}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
