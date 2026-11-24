import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Users, GraduationCap, Wrench } from 'lucide-react';

import Header from '../components/dashboard/Header';
import StudentTable from '../components/StudentTable';
import TechnTable from '../components/TechnTable';
import UserFormModal from '../components/dashboard/UserForm';
import Button from '../components/Button';
import { TableSkeleton } from '../components/dashboard/SkeletonLoaders';
import type { User } from '../types/user';
import { fetchWithAuth } from '../utils/fetchWithAuth';

interface UsuariosPageProps {
  title?: string;
  description?: string;
}

type TabType = 'estudiantes' | 'tecnicos';

export default function UsuariosPage({
  title = 'Gestión de Usuarios',
  description = 'Administra las cuentas de estudiantes y personal técnico del sistema.',
}: UsuariosPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'tecnicos' ? 'tecnicos' : 'estudiantes';
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const [estudiantes, setEstudiantes] = useState<User[]>([]);
  const [tecnicos, setTecnicos] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Sincronizar activeTab cuando cambia el searchParam de la URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'tecnicos' && activeTab !== 'tecnicos') {
      setActiveTab('tecnicos');
    } else if (tabParam !== 'tecnicos' && activeTab !== 'estudiantes') {
      setActiveTab('estudiantes');
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams(tab === 'tecnicos' ? { tab: 'tecnicos' } : {});
  };

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [respEst, respTec] = await Promise.all([
        fetchWithAuth('/usuarios?rol=ESTUDIANTE'),
        fetchWithAuth('/usuarios?rol=TECNICO'),
      ]);

      if (respEst.ok && respTec.ok) {
        const [dataEst, dataTec] = await Promise.all([respEst.json(), respTec.json()]);
        setEstudiantes(dataEst);
        setTecnicos(dataTec);
      } else {
        setError('Error al obtener los usuarios del servidor.');
      }
    } catch {
      setError('No se pudo conectar al servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleCreate = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleSave = () => {
    cargarDatos();
  };

  const isEstudiantes = activeTab === 'estudiantes';
  const totalCount = isEstudiantes ? estudiantes.length : tecnicos.length;

  return (
    <>
      <Header title={title} subtitle={description} />
      <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-(--app-bg)">
        {/* Encabezado y Acción */}
        <div className="flex items-start justify-between gap-3 sm:items-center sm:gap-4">
          <div className="min-w-0 flex-1 text-left">
            <h3 className="text-2xl font-bold text-(--text-primary)">
              {isEstudiantes ? 'Directorio de Estudiantes' : 'Directorio de Personal Técnico'}
            </h3>
            <p className="text-sm text-(--text-secondary) mt-0.5">
              {totalCount} {isEstudiantes ? 'estudiante' : 'técnico'}{totalCount !== 1 ? 's' : ''} registrado{totalCount !== 1 ? 's' : ''} en el sistema
            </p>
          </div>
          <Button
            icon={<Plus className="w-4 h-4" />}
            text={isEstudiantes ? 'Nuevo Estudiante' : 'Nuevo Técnico'}
            ariaLabel={isEstudiantes ? 'Nuevo Estudiante' : 'Nuevo Técnico'}
            type="button"
            onClick={handleCreate}
            variant="create"
            iconOnly
            className="text-sm font-bold"
          />
        </div>

        {/* Selector de Pestañas */}
        <div className="border-b border-(--border-color)">
          <nav className="flex space-x-4" aria-label="Pestañas de usuarios">
            <button
              type="button"
              onClick={() => handleTabChange('estudiantes')}
              className={`flex items-center gap-2.5 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                isEstudiantes
                  ? 'border-blue-600 text-(--tone-blue-text-600)'
                  : 'border-transparent text-(--text-secondary) hover:text-(--text-primary) hover:border-(--border-color)'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-base" />
              <span>Estudiantes</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  isEstudiantes ? 'bg-(--tone-blue-bg-100) text-(--tone-blue-text-700)' : 'bg-(--surface-hover) text-(--text-secondary)'
                }`}
              >
                {estudiantes.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('tecnicos')}
              className={`flex items-center gap-2.5 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                !isEstudiantes
                  ? 'border-blue-600 text-(--tone-blue-text-600)'
                  : 'border-transparent text-(--text-secondary) hover:text-(--text-primary) hover:border-(--border-color)'
              }`}
            >
              <Wrench className="w-4 h-4 text-base" />
              <span>Personal Técnico</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  !isEstudiantes ? 'bg-(--tone-blue-bg-100) text-(--tone-blue-text-700)' : 'bg-(--surface-hover) text-(--text-secondary)'
                }`}
              >
                {tecnicos.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Mensaje de error si ocurre */}
        {error && (
          <div className="text-(--tone-red-text-600) text-sm bg-(--tone-red-bg-100) border border-(--tone-red-border-300) rounded-xl px-4 py-3 text-left">
            {error}
          </div>
        )}

        {/* Contenido según pestaña */}
        {loading ? (
          <TableSkeleton rows={5} showFilters={true} />
        ) : isEstudiantes ? (
          estudiantes.length === 0 ? (
            <div className="text-center py-20 bg-(--surface) rounded-2xl border border-(--border-color)">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-(--surface-muted) flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-(--text-secondary)" />
              </div>
              <h4 className="text-lg font-semibold text-(--text-primary)">Sin estudiantes registrados</h4>
              <p className="text-sm text-(--text-secondary) mt-1">
                Aún no hay estudiantes registrados en el sistema. Puedes añadir uno nuevo.
              </p>
            </div>
          ) : (
            <div className="xl:col-span-2">
              <StudentTable usuarios={estudiantes} onEdit={handleEdit} />
            </div>
          )
        ) : tecnicos.length === 0 ? (
          <div className="text-center py-20 bg-(--surface) rounded-2xl border border-(--border-color)">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-(--surface-muted) flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-(--text-secondary)" />
            </div>
            <h4 className="text-lg font-semibold text-(--text-primary)">Sin técnicos registrados</h4>
            <p className="text-sm text-(--text-secondary) mt-1">
              Aún no hay personal técnico registrado en el sistema. Puedes añadir uno nuevo.
            </p>
          </div>
        ) : (
          <div className="xl:col-span-2">
            <TechnTable usuarios={tecnicos} onEdit={handleEdit} />
          </div>
        )}
      </main>

      <UserFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editingUser={editingUser}
        mode={isEstudiantes ? 'estudiante' : 'tecnico'}
      />
    </>
  );
}

