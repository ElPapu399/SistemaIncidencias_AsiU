import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUsers, faGraduationCap, faScrewdriverWrench } from '@fortawesome/free-solid-svg-icons';

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
      <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-100">
        {/* Encabezado y Acción */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-left">
            <h3 className="text-2xl font-bold text-slate-900">
              {isEstudiantes ? 'Directorio de Estudiantes' : 'Directorio de Personal Técnico'}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {totalCount} {isEstudiantes ? 'estudiante' : 'técnico'}{totalCount !== 1 ? 's' : ''} registrado{totalCount !== 1 ? 's' : ''} en el sistema
            </p>
          </div>
          <Button
            icon={<FontAwesomeIcon icon={faPlus} />}
            text={isEstudiantes ? 'Nuevo Estudiante' : 'Nuevo Técnico'}
            ariaLabel={isEstudiantes ? 'Nuevo Estudiante' : 'Nuevo Técnico'}
            type="button"
            onClick={handleCreate}
            variant="secondary"
          />
        </div>

        {/* Selector de Pestañas */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-4" aria-label="Pestañas de usuarios">
            <button
              type="button"
              onClick={() => handleTabChange('estudiantes')}
              className={`flex items-center gap-2.5 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                isEstudiantes
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <FontAwesomeIcon icon={faGraduationCap} className="text-base" />
              <span>Estudiantes</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  isEstudiantes ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
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
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <FontAwesomeIcon icon={faScrewdriverWrench} className="text-base" />
              <span>Personal Técnico</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  !isEstudiantes ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {tecnicos.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Mensaje de error si ocurre */}
        {error && (
          <div className="text-red-600 text-sm bg-red-100 border border-red-300 rounded-xl px-4 py-3 text-left">
            {error}
          </div>
        )}

        {/* Contenido según pestaña */}
        {loading ? (
          <TableSkeleton rows={5} showFilters={true} />
        ) : isEstudiantes ? (
          estudiantes.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faUsers} className="text-2xl text-slate-400" />
              </div>
              <h4 className="text-lg font-semibold text-slate-900">Sin estudiantes registrados</h4>
              <p className="text-sm text-slate-500 mt-1">
                Aún no hay estudiantes registrados en el sistema. Puedes añadir uno nuevo.
              </p>
            </div>
          ) : (
            <div className="xl:col-span-2">
              <StudentTable usuarios={estudiantes} onEdit={handleEdit} />
            </div>
          )
        ) : tecnicos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <FontAwesomeIcon icon={faUsers} className="text-2xl text-slate-400" />
            </div>
            <h4 className="text-lg font-semibold text-slate-900">Sin técnicos registrados</h4>
            <p className="text-sm text-slate-500 mt-1">
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

