import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUsers } from '@fortawesome/free-solid-svg-icons';

import Header from '../components/dashboard/Header';
import StudentTable from '../components/StudentTable';
import UserFormModal from '../components/dashboard/UserForm';
import Button from '../components/Button';
import { TableSkeleton } from '../components/dashboard/SkeletonLoaders';
import type { User } from '../types/user';
import { fetchWithAuth } from '../utils/fetchWithAuth';

interface EstudiantesPageProps {
    title: string;
    description: string;
}

export default function EstudiantesPage({ title, description }: EstudiantesPageProps) {
    const [estudiantes, setEstudiantes] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const cargarEstudiantes = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetchWithAuth('/usuarios?rol=ESTUDIANTE');
            if (response.ok) {
                const data = await response.json();
                setEstudiantes(data);
            } else {
                setError('Error al cargar estudiantes');
            }
        } catch {
            setError('No se pudo conectar al servidor');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarEstudiantes();
    }, [cargarEstudiantes]);

    const handleCreate = () => {
        setEditingUser(null);
        setModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setModalOpen(true);
    };

    const handleSave = () => {
        cargarEstudiantes();
    };

    const totalEstudiantes = estudiantes.length;

    return (
        <>
            <Header title={title} subtitle={description} />
            <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-100">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 text-left">
                        <h3 className="text-2xl font-bold text-black">Gestión de Estudiantes</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            {totalEstudiantes} estudiante{totalEstudiantes !== 1 ? 's' : ''} registrado{totalEstudiantes !== 1 ? 's' : ''} en el sistema
                        </p>
                    </div>
                    <Button
                        icon={<FontAwesomeIcon icon={faPlus}/>}
                        iconOnly
                        ariaLabel="Nuevo Estudiante"
                        text="Nuevo Estudiante"
                        type="button"
                        onClick={handleCreate}
                        variant="secondary"
                    />
                </div>

                {error && (
                    <div className="text-red-600 text-sm bg-red-100 border border-red-300 rounded-xl px-4 py-3">
                        {error}
                    </div>
                )}

                {loading ? (
                    <TableSkeleton rows={5} showFilters={true} />
                ) : estudiantes.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-300 flex items-center justify-center mb-4">
                            <FontAwesomeIcon icon={faUsers} className="text-2xl text-slate-500" />
                        </div>
                        <h4 className="text-lg font-semibold text-black">Sin estudiantes</h4>
                        <p className="text-sm text-slate-500 mt-1">
                            Aún no hay estudiantes registrados. Crea el primero.
                        </p>
                    </div>
                ) : (
                    <div className="xl:col-span-2">
                        <StudentTable usuarios={estudiantes} onEdit={handleEdit} />
                    </div>
                )}
            </main>

            <UserFormModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                editingUser={editingUser}
                mode="estudiante"
            />
        </>
    );
}
